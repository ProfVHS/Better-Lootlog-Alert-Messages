// ==UserScript==
// @name         Better LL Alert Messages
// @version      2024-12-27
// @description  Better design for LL messages
// @author       GMBLR
// @match        https://*.margonem.pl/
// @match        https://*.margonem.com/
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function createDynamicStyles() {
    const style = document.createElement("style");
    style.type = "text/css";

    const css = `
    .cll-alert.gmblr-alert {
      background: #171819;
      border: none;
      border-radius: 8px;
    }

    .gmblr-alert-header {
      color: #fff;
      border-bottom: 1px solid rgba(253, 75, 75, 0.6);
      padding: 4px 0;
    }

    .gmblr-alert-content {
    justify-content: center;
    gap: 8px;
      color: rgba(255, 255, 255, 0.4);
    }

    .gmblr-alert-message {
    color: rgba(255, 255, 255, 0.8);
    }

    .gmblr-alert-time{
        color: rgba(255,255,255,0.15);
    position: absolute;
    left: 6px;
    top: 6px;
    }

    .cll-alert-buttons .gmblr-alert-button {
      background: rgba(253, 75, 75, 0.6);
      box-shadow: 0px 4px 0px rgba(0, 0, 0, 0.8);
      border-radius: 4px;
      transition: 0.1s ease;
    }

    .cll-alert-buttons .gmblr-alert-button:hover {
      background: rgba(255, 26, 26, 0.6);
    }

    .gmblr-button {
      background: rgba(253, 75, 75, 0.6);
      box-shadow: 0px 4px 0px rgba(0, 0, 0, 0.8);
      border-radius: 4px;
      transition: 0.1s ease;
      font-size: 11px;
      border: none;
      padding: 7px 13px 4px;
      cursor: pointer;
      outline: none;
      color: white;
      margin-top: 8px;
    }

    .gmblr-button:hover {
      background: rgba(255, 26, 26, 0.6);
    }

    .gmblr-ignore-menu{
        position: absolute;
        z-index: 420;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #171819;
        padding: 16px;
        color: #FFF;
        font-size: 14px;
        border-radius: 8px;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
  `;

    style.innerHTML = css;
    document.head.appendChild(style);
  }

  function ignoreUser(alert, user, message) {
    if (!localStorage.getItem("gmblr-ignore-ll-players") || !localStorage.getItem("gmblr-ignore-ll-messages")) return;

    const ignoredUsers = localStorage.getItem("gmblr-ignore-ll-players").toLowerCase().split(",");
    const ignoredMessages = localStorage.getItem("gmblr-ignore-ll-messages").toLowerCase().split(",");

    if (!ignoredUsers.includes(user.toLowerCase())) return;
    const formattedMessage = message.toLowerCase();
    if (!ignoredMessages.includes(formattedMessage)) return;

    const hideButton = alert.querySelector("#cll-ok");
    hideButton.click();
  }

  const addButtonToGameLayer = () => {
    const gameLayer = document.querySelector(".game-layer");

    const ignoreMenuButton = document.createElement("div");
    ignoreMenuButton.classList.add("cll-launcher");
    ignoreMenuButton.style.bottom = "85px";
    ignoreMenuButton.textContent = "I";
    ignoreMenuButton.onclick = () => {
      showIgnoreMenu();
    };

    gameLayer.appendChild(ignoreMenuButton);
  };

  const saveIgnoreList = () => {
    const ignorePlayersInput = document.getElementById("ll-ignore-player");
    const ignoreMessagesInput = document.getElementById("ll-ignore-messages");

    localStorage.setItem("gmblr-ignore-ll-players", ignorePlayersInput.value);
    localStorage.setItem("gmblr-ignore-ll-messages", ignoreMessagesInput.value);
  };

  const showIgnoreMenu = () => {
    const ignoreMenu = document.createElement("div");
    ignoreMenu.classList.add("gmblr-ignore-menu");

    ignoreMenu.innerHTML += "<h1>Ignore Menu</h1>";
    ignoreMenu.innerHTML += "Nicknames (nick,nick2)";

    const inputIgnorePlayers = document.createElement("input");
    inputIgnorePlayers.id = "ll-ignore-player";
    ignoreMenu.appendChild(inputIgnorePlayers);

    ignoreMenu.innerHTML += "Messages (message,new message,message2)";

    const inputIgnoreMessages = document.createElement("input");
    inputIgnoreMessages.id = "ll-ignore-messages";
    ignoreMenu.appendChild(inputIgnoreMessages);

    const saveButton = document.createElement("button");
    saveButton.innerHTML = "Zapisz";
    saveButton.onclick = saveIgnoreList;
    saveButton.className = "gmblr-button";

    const exitButton = document.createElement("button");
    exitButton.innerHTML = "Zamknij";
    exitButton.onclick = () => {
      ignoreMenu.remove();
    };
    exitButton.className = "gmblr-button";

    ignoreMenu.appendChild(saveButton);
    ignoreMenu.appendChild(exitButton);

    document.body.appendChild(ignoreMenu);
  };

  function newContent(alert, content) {
    const contentText = content.textContent;

    const [message, user] = contentText.split("//");

    if (!user || !message) return;

    ignoreUser(alert, user, message);

    const userSpan = document.createElement("span");
    userSpan.textContent = user.trim() + ":";
    userSpan.classList.add("gmblr-alert-username");

    const messageSpan = document.createElement("span");
    messageSpan.textContent = message.trim();
    messageSpan.classList.add("gmblr-alert-message");

    const messageDiv = document.createElement("div");

    messageDiv.appendChild(userSpan);
    messageDiv.appendChild(messageSpan);
    messageDiv.classList.add("gmblr-alert-content");
    messageDiv.style.display = "flex";

    content.remove();

    alert.querySelector(".cll-alert-header").after(messageDiv);
  }

  function addTimeToAlert(alert) {
    if (alert.querySelector(".gmblr-alert-time")) return;

    const now = new Date();
    const padL = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);

    const dateSpan = document.createElement("span");
    dateSpan.textContent = `${padL(now.getHours())}:${padL(now.getMinutes())}`;

    dateSpan.classList.add("gmblr-alert-time");
    alert.appendChild(dateSpan);
  }

  function addStyleToAlert(alert) {
    alert.classList.add("gmblr-alert");

    const header = alert.querySelector(".cll-alert-header");
    if (header) {
      header.classList.add("gmblr-alert-header");
    }

    const message = alert.querySelector(".cll-alert-content");
    if (message) {
      message.classList.add("gmblr-alert-content");
      newContent(alert, message);
    }

    const buttons = alert.querySelector(".cll-alert-buttons").querySelectorAll("button");
    buttons.forEach((button) => {
      button.classList.add("gmblr-alert-button");
    });
  }

  function init() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.classList.contains("cll-alert")) {
              addStyleToAlert(node);
              addTimeToAlert(node);
            }
          });
        }
      });
    });

    const config = { childList: true, subtree: true };
    const body = document.body;

    observer.observe(body, config);
  }

  createDynamicStyles();
  addButtonToGameLayer();
  init();
})();
