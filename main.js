import questions from "./data.js";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const EMAIL = "duythanhpham2603@gmail.com";

var currentIndex = 0;
var username = "";
var message = "";
var data = {};

document.addEventListener("DOMContentLoaded", () => {
  // select needed elements
  let sections;
  let nextButtonElements;
  let backButtonElements;
  let optionItemElements;
  const rejectButtonElement = $(".btn--no");
  const agreeButtonElement = $("#agree-btn");
  const wrapperElement = $(".app");
  const introductionSection = $("#introduction");
  const introImageElement = introductionSection.querySelector("img");
  const dateSection = $("#date-section");
  const datePickerElement = $("#date");
  const resultSection = $(".result");
  const byeSection = $("#bye");
  const returnButtonElement = $(".btn--return");
  const mailFormElement = $("#email-form");
  const mailSenderElement = $('#email-form input[type="email"]');
  const mailNameElement = $('#email-form input[name="name"]');
  const mailFormContent = $("#email-form textarea");
  const mailFormRedirectElement = $('#email-form input[name="_next"]');

  // define functions
  const handleRandomlyChangePosition = (event) => {
    // change intro image
    introImageElement.src = "/assets/images/cry.gif";

    const introductionSectionRect = introductionSection.getBoundingClientRect();
    const rejectButtonRect = rejectButtonElement.getBoundingClientRect();
    const agreeButtonRect = agreeButtonElement.getBoundingClientRect();

    let randomX, randomY;
    let isValidPositionFound = false;

    while (!isValidPositionFound) {
      randomX =
        Math.floor(
          Math.random() *
            (introductionSectionRect.width - rejectButtonRect.width)
        ) + 2;
      randomY =
        Math.floor(
          Math.random() *
            (introductionSectionRect.height - rejectButtonRect.height)
        ) + 2;

      // Check if the new position overlaps with the "Yes" button
      if (
        !(
          randomX < agreeButtonRect.right &&
          randomX + rejectButtonRect.width > agreeButtonRect.left &&
          randomY < agreeButtonRect.bottom &&
          randomY + rejectButtonRect.height > agreeButtonRect.top
        )
      ) {
        isValidPositionFound = true;
      }
    }

    rejectButtonElement.style.position = "absolute";
    rejectButtonElement.style.zIndex = 2;
    rejectButtonElement.style.left = randomX + "px";
    rejectButtonElement.style.top = randomY + "px";
  };

  const handleActiveNextButtons = () => {
    nextButtonElements.forEach((button, index) => {
      if (index === 0) return;
      const sectionId = button.closest("section").id;
      button.classList.toggle("disabled", !data[sectionId]);
    });
  };

  const handleSetMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    datePickerElement.min = minDateTime;
  };

  const handleChangeSection = () => {
    sections.forEach((section) => {
      const id = Number(section.dataset.id);
      section.style.display = id === currentIndex ? "flex" : "none";
    });
  };

  const renderQuestionSections = () => {
    questions.forEach((question) => {
      const questionSection = document.createElement("section");
      questionSection.classList.add(question?.type + "-section");
      questionSection.id = question?.type;
      questionSection.setAttribute("data-id", question.id);

      const optionsHtml =
        question?.options.reduce((result, currentOption) => {
          return (result += `
        <li id="${question?.type}-${currentOption?.id}" class="option-item">
          <img alt="${question?.type} option ${currentOption?.id}" src="${currentOption?.image}" />
          <span>${currentOption?.name}</span>
        </li>
      `);
        }, "") || "";

      questionSection.innerHTML = `
      <h2 class="question">${question?.title}</h2>
      <ul class="options">
        ${optionsHtml}
      </ul>
      <div class="options">
        <button class="btn btn--back">Back</button>
        <button class="btn btn--next">Next</button>
      </div>
    `;

      questionSection.style.display = "none";
      wrapperElement.appendChild(questionSection);
    });

    sections = $$("section");
    nextButtonElements = $$(".btn--next");
    optionItemElements = $$(".option-item");
    backButtonElements = $$(".btn--back");

    // disable nextButtons if do not choose options
    handleActiveNextButtons();
  };

  const handleBeforeUnload = (event) => {
    if (Object.keys(data).length && currentIndex <= questions.length + 1) {
      event.preventDefault();
      event.returnValue = "Your data will not be stored";
    }
  };

  const handleSendEmail = async () => {
    if (!username.trim()) return;

    window.removeEventListener("beforeunload", handleBeforeUnload);
    // send email to duy
    mailFormElement.action = `https://formsubmit.co/${EMAIL}`;
    mailNameElement.setAttribute("placeholder", username);
    mailNameElement.value = username;
    mailSenderElement.setAttribute("placeholder", EMAIL);
    mailSenderElement.value = EMAIL;
    mailFormRedirectElement.value = window.location.origin + "/index.html";
    const content = `
    Bạn vừa nhận được lời mời đi chơi từ ${username}\n
    Thời gian : ${data?.date}\n
    Địa điểm đi chơi : ${data?.destinations
      .map((item) => item.toLowerCase())
      .join(", ")}\n
    Món ăn yêu thích : ${data?.foods
      .map((item) => item.toLowerCase())
      .join(", ")}\n
    Đồ uống yêu thích: ${data?.drinks
      .map((item) => item.toLowerCase())
      .join(", ")}\n
    Với lời nhắn là : ${message.trim() || "No message"} `;
    mailFormContent.value = content;
    mailFormContent.setAttribute("placeholder", content.trim());

    try {
      await mailFormElement.submit();
      resultSection.style.display = "none";
      byeSection.style.display = "flex";
    } catch (error) {
      window.alert(error);
    }
  };

  const handleRenderResult = () => {
    const destinationResult =
      data?.destinations.map((item) => item.toLowerCase()).join(", ") || "";
    const foodResult =
      data?.foods.map((item) => item.toLowerCase()).join(", ") || "";
    const drinkResult =
      data?.drinks.map((item) => item.toLowerCase()).join(", ") || "";

    const html = `<h2 class="question">Lịch hẹn đi chơi</h2>
                  <p>Bạn sẽ hẹn Duy: <strong>${data?.date}</strong></p>
                    <p>Bạn thích đi: <strong>${destinationResult}</strong></p>
                    <p>Bạn thích ăn: <strong>${foodResult}</strong></p>
                    <p>Bạn thích uống: <strong>${drinkResult}</strong></p>
                  
                    <div class="user-form">
                      <h3>Thông tin của bạn</h3>
                      <div class="form-group">
                        <label for="username">Tên của bạn*: </label>
                        <input required spellcheck=false type="text" id="username" placeholder="Nhập tên..." value="${
                          username || ""
                        }" >
                      </div>
                      <div class="form-group">
                        <label for="message">Muốn nhắn gì cho Duy hong (không bắt buộc): </label><br />
                        <textarea id="message" rows="5" spellcheck=false placeholder="Nhập lời nhắn...">${
                          message || ""
                        }</textarea>
                      </div>
                    </div>
                    <div class="options">
                      <button class="btn btn--back">Back</button>
                      <button class="btn btn--next" id="btn-send">Send invitation</button>
                    </div>`;

    resultSection.innerHTML = html;
    sections.forEach((section) => (section.style.display = "none"));
    resultSection.style.display = "flex";

    const usernameInputElement = resultSection.querySelector("#username");
    const messageInputElement = resultSection.querySelector("#message");

    resultSection.querySelector(".btn--back").onclick = () => {
      currentIndex--;
      handleChangeSection();
    };

    resultSection.querySelector("#btn-send").onclick = () => {
      if (!username.trim()) {
        window.alert("Cho Duy biết tên của bạn (hoặc nickname) nè!");
        usernameInputElement.value = "";
        usernameInputElement.focus();
        return;
      }
      currentIndex++;
      handleSendEmail();
    };

    usernameInputElement.oninput = (event) => {
      username = event.target.value.trim();
    };

    messageInputElement.onchange = (event) => {
      message = event.target.value.trim();
    };
  };

  // call handler functions
  handleSetMinDateTime();
  renderQuestionSections();

  //set events
  window.addEventListener("beforeunload", handleBeforeUnload);

  rejectButtonElement.addEventListener(
    "mouseover",
    handleRandomlyChangePosition
  );

  rejectButtonElement.addEventListener("click", handleRandomlyChangePosition);

  agreeButtonElement.onclick = () => {
    introductionSection.style.display = "none";
    dateSection.style.display = "flex";
  };

  agreeButtonElement.onmouseover = () => {
    introImageElement.src = "/assets/images/cute1.gif";
  };

  datePickerElement.onchange = (event) => {
    const inputValue = event.target.value;
    if (!inputValue) delete data.date;
    else {
      const [date, time] = inputValue.trim().split("T");
      const [year, month, day] = date.split("-");
      const result = `vào lúc ${time} ngày ${day}/${month}/${year}`;
      data.date = result;
    }

    dateSection
      .querySelector(".btn--next")
      .classList.toggle("disabled", !data.date);
  };

  // move to next question section
  nextButtonElements.forEach((button) => {
    button.onclick = function (event) {
      if (currentIndex === questions.length) {
        //show result section and return
        currentIndex++;
        handleRenderResult();
        return;
      }

      currentIndex++;
      handleChangeSection();
    };
  });

  // back to previous question
  backButtonElements.forEach((button) => {
    button.onclick = () => {
      if (currentIndex === 0) return;
      currentIndex--;
      handleChangeSection();
    };
  });

  // active option item when click and save data
  optionItemElements.forEach((item) => {
    item.onclick = (event) => {
      // check this item belong to what question section
      const sectionId = event.target.closest("section").id;
      const newValue = item.querySelector("span").innerText;

      if (!data[sectionId]) {
        data[sectionId] = [newValue];
        item.classList.add("active");
      } else {
        if (data[sectionId].includes(newValue)) {
          data[sectionId] = data[sectionId].filter(
            (value) => value !== newValue
          );
          if (!data[sectionId].length) delete data[sectionId];
          item.classList.remove("active");
        } else {
          data[sectionId].push(newValue);
          item.classList.add("active");
        }
      }

      handleActiveNextButtons();
    };
  });

  returnButtonElement.onclick = () => {
    window.location.reload();
  };
});
