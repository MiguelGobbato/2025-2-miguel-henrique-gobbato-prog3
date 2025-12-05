// This file contains utility functions that support the other scripts, such as date formatting, validation, and local storage management for saving user data.

const Utils = (function(){
    function pad(n){ return n < 10 ? '0'+n : ''+n }
    function ymdFromDate(d){
        const y=d.getFullYear(), m=d.getMonth()+1, day=d.getDate()
        return `${y}-${pad(m)}-${pad(day)}`
    }
    function parseYmd(s){
        const [y,m,d] = s.split('-').map(Number)
        return new Date(y, m-1, d)
    }
    function currency(v){
        return Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
    }
    function uid(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2,9) }
    return {ymdFromDate, parseYmd, currency, uid}
})()