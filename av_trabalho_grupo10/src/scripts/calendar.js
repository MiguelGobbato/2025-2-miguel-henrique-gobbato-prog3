(function(){
    let currentDate = new Date();
    let listenersInitialized = false;
    let onSelect = null;

    const monthYearEl = () => document.getElementById('month-year');
    const gridEl = () => document.getElementById('calendar-grid');
    const prevBtn = () => document.getElementById('prev-month');
    const nextBtn = () => document.getElementById('next-month');
    const todayBtn = () => document.getElementById('today-btn');

    function setCurrent(y, m){
        currentDate = new Date(y, m, 1);
    }

    function changeMonth(delta){
        currentDate.setMonth(currentDate.getMonth() + delta);
        // re-render keeping same selected (caller may re-call render with selectedYmd)
        render(currentDate.getFullYear(), currentDate.getMonth(), null, null);
    }

    function goToday(){
        currentDate = new Date();
        render(currentDate.getFullYear(), currentDate.getMonth(), null, null);
    }

    // render(year:number, month:number, selectedYmd:string|null, dataForDay:function)
    function render(year, month, selectedYmd, dataForDay){
        if (typeof year === 'number' && typeof month === 'number') {
            setCurrent(year, month);
        }
        const year0 = currentDate.getFullYear();
        const month0 = currentDate.getMonth();

        monthYearEl().textContent = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

        const grid = gridEl();
        grid.innerHTML = '';

        const firstDayOfMonth = new Date(year0, month0, 1);
        const lastDayOfMonth = new Date(year0, month0 + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();

        let startWeekday = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
        // if you want week to start on Monday: startWeekday = (startWeekday + 6) % 7;

        for (let i = 0; i < startWeekday; i++){
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-cell empty';
            grid.appendChild(emptyCell);
        }

        for (let d = 1; d <= daysInMonth; d++){
            const cell = document.createElement('button');
            cell.className = 'calendar-cell day';
            cell.textContent = d;
            const cellDate = new Date(year0, month0, d);
            const ymd = Utils.ymdFromDate(cellDate);
            cell.dataset.ymd = ymd;

            const today = new Date();
            if (today.getFullYear() === year0 && today.getMonth() === month0 && today.getDate() === d){
                cell.classList.add('today');
            }

            if (selectedYmd && selectedYmd === ymd){
                cell.classList.add('selected');
            }

            // indicator for days that have movements (planner provides dataForDay)
            if (typeof dataForDay === 'function') {
                try {
                    const info = dataForDay(ymd);
                    if (info) {
                        const dot = document.createElement('span');
                        dot.className = 'day-indicator';
                        // simple visual indicator (can be styled in CSS)
                        cell.appendChild(dot);
                    }
                } catch (e) {
                    // ignore errors from dataForDay callback
                }
            }

            cell.addEventListener('click', () => {
                // dispatch to any old listeners
                const evt = new CustomEvent('calendar:dateSelected', { detail: { date: cellDate, ymd } });
                document.dispatchEvent(evt);
                // call modern onSelect if provided (planner expects ymd string)
                if (typeof onSelect === 'function') onSelect(ymd);
                // visual selection
                document.querySelectorAll('.calendar-cell.day.selected').forEach(n => n.classList.remove('selected'));
                cell.classList.add('selected');
            });

            grid.appendChild(cell);
        }
    }

    function initListeners(){
        if (listenersInitialized) return;
        listenersInitialized = true;

        prevBtn().addEventListener('click', () => changeMonth(-1));
        nextBtn().addEventListener('click', () => changeMonth(1));
        todayBtn().addEventListener('click', goToday);

        // maintain compatibility with older code using the custom event
        document.addEventListener('calendar:dateSelected', (e) => {
            const sel = document.getElementById('selected-date');
            if (sel && e.detail && e.detail.date) {
                sel.textContent = e.detail.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
            }
        });
    }

    function init(options = {}){
        if (options && typeof options.onSelect === 'function') onSelect = options.onSelect;
        initListeners();
        // initial render
        render(currentDate.getFullYear(), currentDate.getMonth(), options.selectedYmd || null, options.dataForDay || null);
    }

    // export API expected by planner.js
    window.Calendar = {
        init,
        render,
        changeMonth,
        goToday,
        getCurrentDate: () => new Date(currentDate.getTime())
    };

    // auto-init listeners/render when DOM ready (safe if planner also calls Calendar.init)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { init(); });
    } else {
        init();
    }
})();