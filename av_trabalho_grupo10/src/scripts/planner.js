// This file manages the financial planner functionality, including tracking expenses, salary entries, and setting financial goals.

    const Planner = (function(){
        const STORAGE_KEY = 'fp_data_v1'
        let state = { items: {}, goals: [] }
        let selected = Utils.ymdFromDate(new Date())

        function load(){
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) {
                try {
                    state = JSON.parse(raw)
                } catch(e){
                    state = { items: {}, goals: [] }
                }
            } else {
                state = { items: {}, goals: [] }
            }

            // Normaliza estrutura: garante tipos e amounts numéricos
            state.items = state.items || {}
            for (const ymd in state.items) {
                state.items[ymd] = (state.items[ymd] || []).map(it => ({
                    id: it.id || Utils.uid('it'),
                    type: it.type === 'salary' ? 'salary' : 'expense',
                    name: it.name || (it.type === 'salary' ? 'Salário' : 'Despesa'),
                    amount: Number(it.amount) || 0
                }))
                if (state.items[ymd].length === 0) delete state.items[ymd]
            }
            state.goals = (state.goals || []).map(g => ({
                id: g.id || Utils.uid('g'),
                name: g.name || 'Meta',
                amount: Number(g.amount) || 0
            }))

            save() // ensure structure persisted
        }
        function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }

        function sumForDay(ymd){
            const arr = state.items[ymd] || []
            return arr.reduce((acc,it)=>{
                if (it.type === 'salary') acc.salary += Number(it.amount)
                if (it.type === 'expense') acc.expense += Number(it.amount)
                return acc
            }, {salary:0, expense:0})
        }
        function totalBalance(){
            let bal = 0
            for(const ymd in state.items){
                for(const it of state.items[ymd]){
                    bal += (it.type === 'salary' ? Number(it.amount) : -Number(it.amount))
                }
            }
            return bal
        }

        function renderCalendar(y,m,selectedYmd){
            const dataForDay = (ymd)=>{
                const s = sumForDay(ymd)
                return (s.salary || s.expense) ? s : null
            }
            Calendar.render(y,m,selectedYmd, dataForDay)
        }

        function renderSelected(){
            document.getElementById('selected-date').textContent = 'Dia: ' + selected
            document.getElementById('total-balance').textContent = Utils.currency(totalBalance())
            const list = document.getElementById('items-list'); list.innerHTML=''
            const arr = state.items[selected] || []
            if (arr.length === 0){
                const li = document.createElement('li'); li.innerHTML = '<small class="muted">Nenhum movimento neste dia</small>'; list.appendChild(li)
            } else {
                arr.forEach(it=>{

                    const li = document.createElement('li')
                    const left = document.createElement('div'); left.className='item-left'
                    const typeLabel = it.type === 'salary' ? 'Salário' : 'Despesa'
                    left.innerHTML = `<strong>${it.name || typeLabel}</strong><small class="muted">${typeLabel}</small>`
                    const right = document.createElement('div')
                    // garante que amount sempre seja número ao formatar
                    const amt = Number(it.amount) || 0
                    right.innerHTML = `<div class="item-amount">${it.type==='salary'?'+':'-'} ${Utils.currency(amt)}</div><button data-id="${it.id}" class="del-btn">Remover</button>`
                    li.appendChild(left); li.appendChild(right)
                    list.appendChild(li)
                    // animação de entrada
                    li.classList.add('item-enter')
                    li.querySelector('.del-btn').addEventListener('click', ()=>{ removeItem(selected, it.id) })
                })
            }
            renderGoals()
            Calendar.init({
                onSelect: (ymd)=>{ selected = ymd; renderAll() },
                render: renderCalendar
            })
            Calendar.render(new Date(selected).getFullYear(), new Date(selected).getMonth(), selected, (ymd)=> {
                const s = sumForDay(ymd)
                return (s.salary || s.expense) ? s : null
            })
        }

        function addItem(ymd, type, name, amount){
            if (!state.items[ymd]) state.items[ymd] = []
            state.items[ymd].push({ id: Utils.uid('it'), type, name: name || (type==='salary'?'Salário':'Despesa'), amount: Number(amount) })
            save(); renderAll()
        }
        function removeItem(ymd, id){
            state.items[ymd] = (state.items[ymd] || []).filter(i=>i.id !== id)
            if (state.items[ymd].length===0) delete state.items[ymd]
            save(); renderAll()
        }

        function addGoal(name, amount){
            state.goals.push({ id: Utils.uid('g'), name, amount: Number(amount) })
            save(); renderAll()
        }
        function removeGoal(id){
            state.goals = state.goals.filter(g=>g.id!==id)
            save(); renderAll()
        }
        function renderGoals(){
            const el = document.getElementById('goals-list'); el.innerHTML=''
            const balance = totalBalance()
            if (state.goals.length===0){
                const li=document.createElement('li'); li.innerHTML='<small class="muted">Nenhuma meta definida</small>'; el.appendChild(li); return
            }
            state.goals.forEach(g=>{
                const li=document.createElement('li')
                const progress = Math.max(0, Math.min(100, Math.round((balance / g.amount) * 100)))
                li.innerHTML = `<div style="flex:1"><strong>${g.name}</strong><small class="muted"> | Meta: ${Utils.currency(g.amount)}</small>
                    <div class="goal-progress"><i style="width:${progress}%"></i></div></div>
                    <div style="margin-left:12px;text-align:right">
                        <div><strong>${progress}%</strong></div>
                        <button data-id="${g.id}" class="del-goal">Remover</button>
                    </div>`
                el.appendChild(li)
                li.querySelector('.del-goal').addEventListener('click', ()=> removeGoal(g.id))
            })
        }

        function bindForms(){
            document.getElementById('expense-form').addEventListener('submit', e=>{
                e.preventDefault()
                const name = document.getElementById('expense-name').value.trim()
                const amountRaw = document.getElementById('expense-amount').value
                const amount = parseFloat(amountRaw)
                if (isNaN(amount) || amount <= 0) return
                addItem(selected, 'expense', name, amount)
                e.target.reset()
            })
            document.getElementById('salary-form').addEventListener('submit', e=>{
                e.preventDefault()
                const amountRaw = document.getElementById('salary-amount').value
                const amount = parseFloat(amountRaw)
                if (isNaN(amount) || amount <= 0) return
                addItem(selected, 'salary', 'Salário', amount)
                e.target.reset()
            })
            document.getElementById('goal-form').addEventListener('submit', e=>{
                e.preventDefault()
                const name = document.getElementById('goal-name').value.trim()
                const amountRaw = document.getElementById('goal-amount').value
                const amount = parseFloat(amountRaw)
                if (!name || isNaN(amount) || amount <= 0) return
                addGoal(name, amount)
                e.target.reset()
            })
        }

        function renderAll(){
            renderSelected()
        }

        function start(){
            load()
            bindForms()
            renderAll()
        }

        return { start }
    })()

    document.addEventListener('DOMContentLoaded', ()=> Planner.start())