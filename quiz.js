let data=[],i=0,score=0,startTime,answers=[];

function startQuiz(){
  window.IS_ADMIN = (
  dept === "NHÂN SỰ" ||
  dept === "HR" ||
  dept === "BAN GIÁM ĐỐC"
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
  const q = questions[index];
  if (!q) return;

  let html = `
    <div class="q-title">
      <b>Câu ${index + 1}/${questions.length}</b>
    </div>

    <div class="q-text">
      ${q.q}
    </div>

    <div class="answers">
  `;

  q.a.forEach((ans, i) => {
    html += `
      <label class="ans">
        <input type="radio" name="ans" value="${i}">
        <span>${ans}</span>
      </label>
    `;
  });

  html += `</div>`;

  /* ===== PREVIEW ĐÁP ÁN ĐÚNG (HR / ADMIN) ===== */
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

  html += `
    <button class="btn" onclick="next()">Tiếp</button>
  `;

  document.getElementById("quiz").innerHTML = html;
}
function next(){
  const c=document.querySelector("input[name=a]:checked");
  answers.push(c?c.value:null);
  if(c && c.value==data[i].correct) score++;
  i++;
  if(i<data.length) render();
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
  fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"submit",
      score,
      time:Math.floor((Date.now()-startTime)/1000),
      answers
    })
  }).then(()=>alert("Đã nộp bài"));
}
