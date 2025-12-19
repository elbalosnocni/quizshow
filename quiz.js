const loginBox = document.getElementById("loginBox");
const quizBox  = document.getElementById("quizBox");
const msg      = document.getElementById("msg");
const timer    = document.getElementById("timer");

const empId   = document.getElementById("empId");
const empName = document.getElementById("empName");
const dept    = document.getElementById("dept");

let data = [], i = 0, score = 0, startTime, answers = [];
let submitted = false;

function startQuiz(){
 window.IS_ADMIN = (
  dept.value === "NHÂN SỰ" ||
  dept.value === "HR" ||
  dept.value === "BAN GIÁM ĐỐC"
);

  const now=new Date();
  if(now<QUIZ_CONFIG.startTime||now>QUIZ_CONFIG.endTime){
    msg.innerText="⛔ Ngoài thời gian thi";
    return;
  }
  fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"start",
      empId:empId.value,
      empName:empName.value,
      dept:dept.value
    })
  }).then(r=>r.json()).then(res=>{
    if(res.error){msg.innerText=res.error;return;}
    data=res.questions;
    loginBox.classList.add("hidden");
    quizBox.classList.remove("hidden");
    startTime=Date.now();
    tick();
    render();
  });
}

function render() {
  const q = data[i];
  if (!q) return;

  let html = `
    <div class="q-title">
      <b>Câu ${i + 1}/${data.length}</b>
    </div>

    <div class="q-text">${q.q}</div>
    <div class="answers">
  `;

  q.a.forEach((ans, idx) => {
    html += `
      <label class="ans">
        <input type="radio" name="ans" value="${idx}">
        <span>${ans}</span>
      </label>
    `;
  });

  html += `</div>`;

  if (window.IS_ADMIN) {
    html += `
      <div style="
        margin-top:12px;
        padding:8px;
        background:#e6fafa;
        color:#0ac0ca;
        border-radius:6px;
        font-size:13px">
        ✔ Đáp án đúng: <b>${q.correctText}</b>
      </div>
    `;
  }

  html += `<button class="btn" onclick="next()">Tiếp</button>`;
  quizBox.innerHTML = html;
}

function next(){
  const c = document.querySelector("input[name=ans]:checked");
  if (!c) {
    alert("⚠️ Vui lòng chọn đáp án");
    return;
  }

  answers.push(Number(c.value));
  if (Number(c.value) === data[i].correct) score++;

  i++;
  if (i < data.length) render();
  else submit();
}

function tick(){
  let t=QUIZ_CONFIG.duration-
        Math.floor((Date.now()-startTime)/1000);
  if(t<=0){submit();return;}
  timer.innerText=`⏱️ ${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`;
  setTimeout(tick,1000);
}

function submit(){
  if (submitted) return;
  submitted = true;

  fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      action: "submit",
      empId: empId.value,
      score: score,
      time: Math.floor((Date.now()-startTime)/1000),
      answers: answers
    })
  })
  .then(r => r.json())
  .then(res => {

    quizBox.innerHTML = `
      <h2>KẾT QUẢ BÀI THI</h2>
      <p>👤 ${empName.value} (${empId.value})</p>
      <p>📊 Điểm: <b>${res.score}/5</b></p>
      <p>📈 Tỷ lệ: <b>${(res.percent*100).toFixed(0)}%</b></p>
      <p>🏁 Kết quả:
        <b style="color:${res.pass==="PASS"?"green":"red"}">
          ${res.pass}
        </b>
      </p>
      <p>📄 Chứng nhận đã gửi về email</p>
    `;
  });
}


