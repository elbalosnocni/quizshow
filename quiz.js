let data=[],i=0,score=0,startTime,answers=[];

function startQuiz(){
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

function render(){
  progress.innerText=`Câu ${i+1}/${data.length}`;
  question.innerText=data[i].q;
  answers.innerHTML="";
  data[i].a.forEach((x,idx)=>{
    answers.innerHTML+=
      `<label><input type="radio" name="a" value="${idx}"> ${x}</label>`;
  });
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
