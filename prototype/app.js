const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => "NT$ " + Math.round(n).toLocaleString("en-US");
const today = new Date().toISOString().slice(0,10);
const seed = {
 transactions:[
  {id:1,type:"expense",amount:120,category:"Food & drinks",date:today,note:"Lunch with classmates"},
  {id:2,type:"expense",amount:40,category:"Transport",date:today,note:"Metro"},
  {id:3,type:"expense",amount:280,category:"Study",date:today,note:"Course materials"},
  {id:4,type:"income",amount:18000,category:"Allowance",date:today,note:"Monthly allowance"},
  {id:5,type:"expense",amount:160,category:"Food & drinks",date:today,note:"Dinner"},
  {id:6,type:"expense",amount:350,category:"Shopping",date:today,note:"Daily essentials"},
  {id:7,type:"expense",amount:4570,category:"Other",date:today,note:"Accommodation and utilities"}
 ],
 budgets:[
  {category:"Food & drinks",limit:4000,spent:2100,icon:"🍜"},
  {category:"Transport",limit:1200,spent:650,icon:"🚇"},
  {category:"Study",limit:1500,spent:480,icon:"📚"},
  {category:"Shopping",limit:1200,spent:720,icon:"🛍️"},
  {category:"Entertainment",limit:800,spent:360,icon:"🎧"}
 ],
 goals:[
  {id:1,title:"New laptop",target:20000,saved:8400,emoji:"💻"},
  {id:2,title:"Weekend trip",target:6000,saved:2100,emoji:"🧳"}
 ]
};
let state;
try { state = JSON.parse(localStorage.getItem("pocketwise-demo")) || structuredClone(seed); } catch(e) { state=JSON.parse(JSON.stringify(seed)); }
let transactionType="expense";
function persist(){try{localStorage.setItem("pocketwise-demo",JSON.stringify(state));return true}catch(e){return false}}
function totals(){
 const income=state.transactions.filter(t=>t.type==="income").reduce((a,t)=>a+t.amount,0);
 const expense=state.transactions.filter(t=>t.type==="expense").reduce((a,t)=>a+t.amount,0);
 return {income,expense,balance:income-expense};
}
function spentFor(cat){return state.budgets.find(b=>b.category===cat)?.spent || 0}
function render(){
 const t=totals();
 $("#balance").textContent=money(t.balance);
 $("#incomeTotal").textContent=money(t.income);
 $("#expenseTotal").textContent=money(t.expense);
 const planned=state.budgets.reduce((a,b)=>a+b.limit,0), spent=state.budgets.reduce((a,b)=>a+b.spent,0);
 $("#remainingBudget").textContent=money(planned-spent);
 $("#budgetPlanned").textContent=money(planned);$("#budgetSpent").textContent=money(spent);$("#budgetLeft").textContent=money(planned-spent);
 $("#purchaseCount").textContent=state.transactions.filter(x=>x.type==="expense").length;
 $("#budgetPreview").innerHTML=state.budgets.slice(0,3).map(b=>budgetRow(b)).join("");
 $("#budgetFull").innerHTML=state.budgets.map(b=>budgetRow(b)).join("");
 const sorted=[...state.transactions].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
 $("#recentList").innerHTML=sorted.slice(0,4).map(txRow).join("") || empty();
 $("#allTransactions").innerHTML=filteredTransactions(sorted);
 $("#goalList").innerHTML=state.goals.map(g=>`<article class="goal-card"><div class="goal-top"><span class="goal-emoji">${g.emoji}</span><span class="eyebrow">SAVINGS GOAL</span></div><h3>${escapeHtml(g.title)}</h3><div class="goal-amount">${money(g.saved)}</div><small>of ${money(g.target)} target</small><div class="progress"><i style="width:${Math.min(100,g.saved/g.target*100)}%"></i></div><div class="goal-actions"><small>${Math.round(g.saved/g.target*100)}% complete</small><button data-contribute="${g.id}">＋ Add savings</button></div></article>`).join("") || empty();
}
function budgetRow(b){let pct=Math.min(100,b.spent/b.limit*100),cls=pct>=100?"over":pct>=80?"warn":"";return `<div class="budget-row"><div class="budget-meta"><span>${b.icon} &nbsp;${escapeHtml(b.category)}</span><b>${money(b.spent)} <small>/ ${money(b.limit)}</small></b></div><div class="budget-track"><i class="${cls}" style="width:${pct}%"></i></div></div>`}
function txRow(t){return `<div class="transaction-row"><div class="tx-icon">${t.type==="income"?"＋":"−"}</div><div class="tx-info"><b>${escapeHtml(t.note||t.category)}</b><small>${escapeHtml(t.category)} · ${t.date}</small></div><div class="tx-amount ${t.type==="income"?"income":""}">${t.type==="income"?"+":"−"}${money(t.amount)}</div></div>`}
function filteredTransactions(sorted){const q=($("#searchTransactions")?.value||"").toLowerCase(),f=$("#typeFilter")?.value||"all";const arr=sorted.filter(t=>(f==="all"||t.type===f)&&(`${t.note} ${t.category}`.toLowerCase().includes(q)));return arr.map(txRow).join("")||empty("No matching transactions yet.")}
function empty(msg="Nothing to show yet."){return `<div class="empty-state">${msg}</div>`}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove("show"),2500)}
function go(page){$$(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+page));$$("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));const titles={home:"Good afternoon, Mei-Ling",activity:"Your transactions",budgets:"Your budgets",goals:"Your savings goals"};$("#pageTitle").textContent=titles[page]||"PocketWise";window.scrollTo({top:0,behavior:"smooth"})}
function openModal(){ $("#transactionModal").classList.add("open");$("#transactionModal").setAttribute("aria-hidden","false");$("#amount").focus()}
function closeModal(){ $("#transactionModal").classList.remove("open");$("#transactionModal").setAttribute("aria-hidden","true");$("#transactionForm").reset();$("#amountError").textContent="";$("#categoryError").textContent="";$("#formAlert").textContent="";transactionType="expense";$$("[data-type]").forEach(b=>b.classList.toggle("selected",b.dataset.type==="expense"))}
function setType(type){transactionType=type;$$("[data-type]").forEach(b=>b.classList.toggle("selected",b.dataset.type===type));$("#modalTitle").textContent=type==="expense"?"Add expense":"Add income"}
$$("[data-page]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
$("#quickAdd").addEventListener("click",openModal);$("#addTransaction").addEventListener("click",openModal);$("#mobileAdd").addEventListener("click",openModal);
$$("[data-close]").forEach(b=>b.addEventListener("click",closeModal));
$("#transactionModal").addEventListener("click",e=>{if(e.target.id==="transactionModal")closeModal()});
$$("[data-type]").forEach(b=>b.addEventListener("click",()=>setType(b.dataset.type)));
$("#date").value=today;
$("#transactionForm").addEventListener("submit",e=>{
 e.preventDefault();const amount=Number($("#amount").value),category=$("#category").value;
 $("#amountError").textContent=amount>0?"":"Enter an amount greater than NT$0.";
 $("#categoryError").textContent=category?"":"Choose a category to continue.";
 if(!(amount>0)||!Number.isFinite(amount)||!category)return;
 const record={id:Date.now(),type:transactionType,amount:Math.round(amount),category,date:$("#date").value||today,note:$("#note").value.trim()};
 state.transactions.push(record);
 if(transactionType==="expense"){let b=state.budgets.find(x=>x.category===category);if(b)b.spent+=record.amount;}
 if(!persist()){state.transactions.pop();$("#formAlert").textContent="We couldn't save this transaction. Your details are still on this screen. Please retry.";return;}
 render();closeModal();toast("Transaction saved. Your overview is updated.");
});
$("#searchTransactions").addEventListener("input",()=>render());
$("#typeFilter").addEventListener("change",()=>render());
$("#editBudget").addEventListener("click",()=>{const category=prompt("Which category? Enter an existing category name (e.g. Food & drinks):");if(!category)return;const b=state.budgets.find(x=>x.category.toLowerCase()===category.trim().toLowerCase());if(!b){toast("Category not found in demo budgets.");return}const v=Number(prompt("New monthly limit in NT$:",b.limit));if(!(v>0)){toast("Enter a budget greater than NT$0.");return}b.limit=Math.round(v);persist();render();toast("Budget updated.")});
$("#addGoal").addEventListener("click",()=>{const title=prompt("What are you saving for?");if(!title?.trim())return;const target=Number(prompt("What's your target in NT$?"));if(!(target>0)){toast("Enter a target greater than NT$0.");return}state.goals.push({id:Date.now(),title:title.trim(),target:Math.round(target),saved:0,emoji:"🌱"});persist();render();toast("Savings goal created.")});
$("#goalList").addEventListener("click",e=>{const id=Number(e.target.dataset.contribute);if(!id)return;const g=state.goals.find(x=>x.id===id);const v=Number(prompt(`How much would you like to add to ${g.title}? (NT$)`));if(!(v>0)){toast("Enter an amount greater than NT$0.");return}g.saved=Math.min(g.target,g.saved+Math.round(v));persist();render();toast("Savings progress updated.")});
render();
