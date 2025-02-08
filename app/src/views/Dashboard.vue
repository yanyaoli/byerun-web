<template>
  <el-container class="dashboard-container">
    <el-header class="dashboard-header">
      <div class="dashboard-header-content">
        <img
          src="@/assets/logo.png"
          alt="logo"
          class="logo"
          @click="refreshData()"
        />
        <div class="header-right">
          <div class="header-icon-button" @click="toggleTheme">
            <el-icon v-if="!isDarkMode"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill-opacity="0"
                  d="M15.22 6.03l2.53-1.94L14.56 4L13.5 1l-1.06 3l-3.19.09l2.53 1.94l-.91 3.06l2.63-1.81l2.63 1.81z"
                  fill="currentColor"
                >
                  <animate
                    id="lineMdSunnyOutlineToMoonLoopTransition0"
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="0.6s;lineMdSunnyOutlineToMoonLoopTransition0.begin+6s"
                    dur="0.4s"
                    values="0;1"
                  />
                  <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+2.2s"
                    dur="0.4s"
                    values="1;0"
                  />
                </path>
                <path
                  fill-opacity="0"
                  d="M13.61 5.25L15.25 4l-2.06-.05L12.5 2l-.69 1.95L9.75 4l1.64 1.25l-.59 1.98l1.7-1.17l1.7 1.17z"
                  fill="currentColor"
                >
                  <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+3s"
                    dur="0.4s"
                    values="0;1"
                  />
                  <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+5.2s"
                    dur="0.4s"
                    values="1;0"
                  />
                </path>
                <path
                  fill-opacity="0"
                  d="M19.61 12.25L21.25 11l-2.06-.05L18.5 9l-.69 1.95l-2.06.05l1.64 1.25l-.59 1.98l1.7-1.17l1.7 1.17z"
                  fill="currentColor"
                >
                  <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+0.4s"
                    dur="0.4s"
                    values="0;1"
                  />
                  <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+2.8s"
                    dur="0.4s"
                    values="1;0"
                  />
                </path>
                <path
                  fill-opacity="0"
                  d="M20.828 9.731l1.876-1.439l-2.366-.067L19.552 6l-.786 2.225l-2.366.067l1.876 1.439L17.601 12l1.951-1.342L21.503 12z"
                  fill="currentColor"
                >
                  <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+3.4s"
                    dur="0.4s"
                    values="0;1"
                  />
                  <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+5.6s"
                    dur="0.4s"
                    values="1;0"
                  />
                </path>
                <g
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                >
                  <g>
                    <path
                      stroke-dasharray="2"
                      stroke-dashoffset="4"
                      d="M12 21v1M21 12h1M12 3v-1M3 12h-1"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.2s"
                        values="4;2"
                      />
                    </path>
                    <path
                      stroke-dasharray="2"
                      stroke-dashoffset="4"
                      d="M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        begin="0.2s"
                        dur="0.2s"
                        values="4;2"
                      />
                    </path>
                    <set
                      fill="freeze"
                      attributeName="opacity"
                      begin="0.5s"
                      to="0"
                    />
                  </g>
                  <path
                    d="M7 6 C7 12.08 11.92 17 18 17 C18.53 17 19.05 16.96 19.56 16.89 C17.95 19.36 15.17 21 12 21 C7.03 21 3 16.97 3 12 C3 8.83 4.64 6.05 7.11 4.44 C7.04 4.95 7 5.47 7 6 Z"
                    opacity="0"
                  >
                    <set
                      fill="freeze"
                      attributeName="opacity"
                      begin="0.5s"
                      to="1"
                    />
                  </path>
                </g>
                <mask id="lineMdSunnyOutlineToMoonLoopTransition1">
                  <circle cx="12" cy="12" r="12" fill="#fff" />
                  <circle cx="12" cy="12" r="4">
                    <animate
                      fill="freeze"
                      attributeName="r"
                      begin="0.1s"
                      dur="0.4s"
                      values="4;8"
                    />
                  </circle>
                  <circle cx="22" cy="2" r="3" fill="#fff">
                    <animate
                      fill="freeze"
                      attributeName="cx"
                      begin="0.1s"
                      dur="0.4s"
                      values="22;18"
                    />
                    <animate
                      fill="freeze"
                      attributeName="cy"
                      begin="0.1s"
                      dur="0.4s"
                      values="2;6"
                    />
                    <animate
                      fill="freeze"
                      attributeName="r"
                      begin="0.1s"
                      dur="0.4s"
                      values="3;12"
                    />
                  </circle>
                  <circle cx="22" cy="2" r="1">
                    <animate
                      fill="freeze"
                      attributeName="cx"
                      begin="0.1s"
                      dur="0.4s"
                      values="22;18"
                    />
                    <animate
                      fill="freeze"
                      attributeName="cy"
                      begin="0.1s"
                      dur="0.4s"
                      values="2;6"
                    />
                    <animate
                      fill="freeze"
                      attributeName="r"
                      begin="0.1s"
                      dur="0.4s"
                      values="1;10"
                    />
                  </circle>
                </mask>
                <circle
                  cx="12"
                  cy="12"
                  r="6"
                  mask="url(#lineMdSunnyOutlineToMoonLoopTransition1)"
                  fill="currentColor"
                >
                  <animate
                    fill="freeze"
                    attributeName="r"
                    begin="0.1s"
                    dur="0.4s"
                    values="6;10"
                  />
                  <set
                    fill="freeze"
                    attributeName="opacity"
                    begin="0.5s"
                    to="0"
                  />
                </circle></svg
            ></el-icon>
            <el-icon v-else
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                >
                  <path
                    stroke-dasharray="2"
                    stroke-dashoffset="2"
                    d="M12 19v1M19 12h1M12 5v-1M5 12h-1"
                  >
                    <animate
                      fill="freeze"
                      attributeName="d"
                      begin="1.2s"
                      dur="0.2s"
                      values="M12 19v1M19 12h1M12 5v-1M5 12h-1;M12 21v1M21 12h1M12 3v-1M3 12h-1"
                    />
                    <animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      begin="1.2s"
                      dur="0.2s"
                      values="2;0"
                    />
                  </path>
                  <path
                    stroke-dasharray="2"
                    stroke-dashoffset="2"
                    d="M17 17l0.5 0.5M17 7l0.5 -0.5M7 7l-0.5 -0.5M7 17l-0.5 0.5"
                  >
                    <animate
                      fill="freeze"
                      attributeName="d"
                      begin="1.4s"
                      dur="0.2s"
                      values="M17 17l0.5 0.5M17 7l0.5 -0.5M7 7l-0.5 -0.5M7 17l-0.5 0.5;M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5"
                    />
                    <animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      begin="1.4s"
                      dur="0.2s"
                      values="2;0"
                    />
                  </path>
                  <animateTransform
                    attributeName="transform"
                    dur="30s"
                    repeatCount="indefinite"
                    type="rotate"
                    values="0 12 12;360 12 12"
                  />
                </g>
                <g fill="currentColor">
                  <path
                    d="M15.22 6.03L17.75 4.09L14.56 4L13.5 1L12.44 4L9.25 4.09L11.78 6.03L10.87 9.09L13.5 7.28L16.13 9.09L15.22 6.03Z"
                  >
                    <animate
                      fill="freeze"
                      attributeName="fill-opacity"
                      dur="0.4s"
                      values="1;0"
                    />
                  </path>
                  <path
                    d="M19.61 12.25L21.25 11L19.19 10.95L18.5 9L17.81 10.95L15.75 11L17.39 12.25L16.8 14.23L18.5 13.06L20.2 14.23L19.61 12.25Z"
                  >
                    <animate
                      fill="freeze"
                      attributeName="fill-opacity"
                      begin="0.2s"
                      dur="0.4s"
                      values="1;0"
                    />
                  </path>
                </g>
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 6 C7 12.08 11.92 17 18 17 C18.53 17 19.05 16.96 19.56 16.89 C17.95 19.36 15.17 21 12 21 C7.03 21 3 16.97 3 12 C3 8.83 4.64 6.05 7.11 4.44 C7.04 4.95 7 5.47 7 6 Z"
                >
                  <set
                    fill="freeze"
                    attributeName="opacity"
                    begin="0.6s"
                    to="0"
                  />
                </path>
                <mask id="lineMdMoonToSunnyOutlineLoopTransition0">
                  <circle cx="12" cy="12" r="12" fill="#fff" />
                  <circle cx="12" cy="12" r="8">
                    <animate
                      fill="freeze"
                      attributeName="r"
                      begin="0.6s"
                      dur="0.4s"
                      values="8;4"
                    />
                  </circle>
                  <circle cx="18" cy="6" r="12" fill="#fff">
                    <animate
                      fill="freeze"
                      attributeName="cx"
                      begin="0.6s"
                      dur="0.4s"
                      values="18;22"
                    />
                    <animate
                      fill="freeze"
                      attributeName="cy"
                      begin="0.6s"
                      dur="0.4s"
                      values="6;2"
                    />
                    <animate
                      fill="freeze"
                      attributeName="r"
                      begin="0.6s"
                      dur="0.4s"
                      values="12;3"
                    />
                  </circle>
                  <circle cx="18" cy="6" r="10">
                    <animate
                      fill="freeze"
                      attributeName="cx"
                      begin="0.6s"
                      dur="0.4s"
                      values="18;22"
                    />
                    <animate
                      fill="freeze"
                      attributeName="cy"
                      begin="0.6s"
                      dur="0.4s"
                      values="6;2"
                    />
                    <animate
                      fill="freeze"
                      attributeName="r"
                      begin="0.6s"
                      dur="0.4s"
                      values="10;1"
                    />
                  </circle>
                </mask>
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  mask="url(#lineMdMoonToSunnyOutlineLoopTransition0)"
                  opacity="0"
                  fill="currentColor"
                >
                  <animate
                    fill="freeze"
                    attributeName="r"
                    begin="0.6s"
                    dur="0.4s"
                    values="10;6"
                  />
                  <set
                    fill="freeze"
                    attributeName="opacity"
                    begin="0.6s"
                    to="1"
                  />
                </circle></svg
            ></el-icon>
          </div>
          <a
            :href="config.urls.github"
            target="_blank"
            rel="noopener noreferrer"
            class="header-icon-button"
          >
            <el-icon
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <mask id="lineMdGithubLoop0" width="24" height="24" x="0" y="0">
                  <g fill="#fff">
                    <ellipse cx="9.5" cy="9" rx="1.5" ry="1" />
                    <ellipse cx="14.5" cy="9" rx="1.5" ry="1" />
                  </g>
                </mask>
                <g
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                >
                  <path
                    stroke-dasharray="32"
                    stroke-dashoffset="32"
                    d="M12 4c1.67 0 2.61 0.4 3 0.5c0.53 -0.43 1.94 -1.5 3.5 -1.5c0.34 1 0.29 2.22 0 3c0.75 1 1 2 1 3.5c0 2.19 -0.48 3.58 -1.5 4.5c-1.02 0.92 -2.11 1.37 -3.5 1.5c0.65 0.54 0.5 1.87 0.5 2.5c0 0.73 0 3 0 3M12 4c-1.67 0 -2.61 0.4 -3 0.5c-0.53 -0.43 -1.94 -1.5 -3.5 -1.5c-0.34 1 -0.29 2.22 0 3c-0.75 1 -1 2 -1 3.5c0 2.19 0.48 3.58 1.5 4.5c1.02 0.92 2.11 1.37 3.5 1.5c-0.65 0.54 -0.5 1.87 -0.5 2.5c0 0.73 0 3 0 3"
                  >
                    <animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      dur="0.7s"
                      values="32;0"
                    />
                  </path>
                  <path
                    stroke-dasharray="10"
                    stroke-dashoffset="10"
                    d="M9 19c-1.406 0-2.844-.563-3.688-1.188C4.47 17.188 4.22 16.157 3 15.5"
                  >
                    <animate
                      attributeName="d"
                      dur="3s"
                      repeatCount="indefinite"
                      values="M9 19c-1.406 0-2.844-.563-3.688-1.188C4.47 17.188 4.22 16.157 3 15.5;M9 19c-1.406 0-3-.5-4-.5-.532 0-1 0-2-.5;M9 19c-1.406 0-2.844-.563-3.688-1.188C4.47 17.188 4.22 16.157 3 15.5"
                    />
                    <animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      begin="0.8s"
                      dur="0.2s"
                      values="10;0"
                    />
                  </path>
                </g>
                <rect
                  width="8"
                  height="4"
                  x="8"
                  y="11"
                  fill="currentColor"
                  mask="url(#lineMdGithubLoop0)"
                >
                  <animate
                    attributeName="y"
                    dur="10s"
                    keyTimes="0;0.45;0.46;0.54;0.55;1"
                    repeatCount="indefinite"
                    values="11;11;7;7;11;11"
                  />
                </rect></svg
            ></el-icon>
          </a>
          <el-dropdown
            @command="handleCommand"
            trigger="click"
            placement="bottom-end"
          >
            <div class="header-icon-button">
              <el-icon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                >
                  <defs>
                    <symbol id="lineMdCogLoop0">
                      <path
                        d="M15.24 6.37C15.65 6.6 16.04 6.88 16.38 7.2C16.6 7.4 16.8 7.61 16.99 7.83C17.46 8.4 17.85 9.05 18.11 9.77C18.2 10.03 18.28 10.31 18.35 10.59C18.45 11.04 18.5 11.52 18.5 12"
                      >
                        <animate
                          fill="freeze"
                          attributeName="d"
                          begin="0.9s"
                          dur="0.2s"
                          values="M15.24 6.37C15.65 6.6 16.04 6.88 16.38 7.2C16.6 7.4 16.8 7.61 16.99 7.83C17.46 8.4 17.85 9.05 18.11 9.77C18.2 10.03 18.28 10.31 18.35 10.59C18.45 11.04 18.5 11.52 18.5 12;M15.24 6.37C15.65 6.6 16.04 6.88 16.38 7.2C16.38 7.2 19 6.12 19.01 6.14C19.01 6.14 20.57 8.84 20.57 8.84C20.58 8.87 18.35 10.59 18.35 10.59C18.45 11.04 18.5 11.52 18.5 12"
                        />
                      </path>
                    </symbol>
                  </defs>
                  <g fill="none" stroke="currentColor" stroke-width="2">
                    <g stroke-linecap="round">
                      <path
                        stroke-dasharray="20"
                        stroke-dashoffset="20"
                        d="M12 9c1.66 0 3 1.34 3 3c0 1.66 -1.34 3 -3 3c-1.66 0 -3 -1.34 -3 -3c0 -1.66 1.34 -3 3 -3Z"
                      >
                        <animate
                          fill="freeze"
                          attributeName="stroke-dashoffset"
                          dur="0.2s"
                          values="20;0"
                        />
                      </path>
                      <path
                        stroke-dasharray="48"
                        stroke-dashoffset="48"
                        d="M12 5.5c3.59 0 6.5 2.91 6.5 6.5c0 3.59 -2.91 6.5 -6.5 6.5c-3.59 0 -6.5 -2.91 -6.5 -6.5c0 -3.59 2.91 -6.5 6.5 -6.5Z"
                      >
                        <animate
                          fill="freeze"
                          attributeName="stroke-dashoffset"
                          begin="0.2s"
                          dur="0.6s"
                          values="48;0"
                        />
                        <set
                          fill="freeze"
                          attributeName="opacity"
                          begin="0.9s"
                          to="0"
                        />
                      </path>
                    </g>
                    <g opacity="0">
                      <use href="#lineMdCogLoop0" />
                      <use
                        href="#lineMdCogLoop0"
                        transform="rotate(60 12 12)"
                      />
                      <use
                        href="#lineMdCogLoop0"
                        transform="rotate(120 12 12)"
                      />
                      <use
                        href="#lineMdCogLoop0"
                        transform="rotate(180 12 12)"
                      />
                      <use
                        href="#lineMdCogLoop0"
                        transform="rotate(240 12 12)"
                      />
                      <use
                        href="#lineMdCogLoop0"
                        transform="rotate(300 12 12)"
                      />
                      <set
                        fill="freeze"
                        attributeName="opacity"
                        begin="0.9s"
                        to="1"
                      />
                      <animateTransform
                        fill="freeze"
                        attributeName="transform"
                        dur="30s"
                        type="rotate"
                        values="0 12 12;360 12 12"
                      />
                    </g>
                  </g>
                </svg>
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="menu-item">
                <el-dropdown-item command="refresh">
                  <el-icon>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="currentColor"
                        fill-opacity="0"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      >
                        <path
                          stroke-dasharray="20"
                          stroke-dashoffset="20"
                          d="M12 5c1.66 0 3 1.34 3 3c0 1.66 -1.34 3 -3 3c-1.66 0 -3 -1.34 -3 -3c0 -1.66 1.34 -3 3 -3Z"
                        >
                          <animate
                            fill="freeze"
                            attributeName="stroke-dashoffset"
                            dur="0.4s"
                            values="20;0"
                          />
                        </path>
                        <path
                          stroke-dasharray="36"
                          stroke-dashoffset="36"
                          d="M12 14c4 0 7 2 7 3v2h-14v-2c0 -1 3 -3 7 -3Z"
                        >
                          <animate
                            fill="freeze"
                            attributeName="stroke-dashoffset"
                            begin="0.5s"
                            dur="0.5s"
                            values="36;0"
                          />
                        </path>
                        <animate
                          fill="freeze"
                          attributeName="fill-opacity"
                          begin="1.1s"
                          dur="0.5s"
                          values="0;1"
                        />
                      </g>
                    </svg>
                  </el-icon>
                  {{ userStore.userInfo?.name }}
                </el-dropdown-item>
                <el-dropdown-item command="refresh">
                  <el-icon>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      >
                        <path
                          stroke-dasharray="16"
                          stroke-dashoffset="16"
                          d="M12 3c4.97 0 9 4.03 9 9"
                        >
                          <animate
                            fill="freeze"
                            attributeName="stroke-dashoffset"
                            dur="0.3s"
                            values="16;0"
                          />
                          <animateTransform
                            attributeName="transform"
                            dur="1.5s"
                            repeatCount="indefinite"
                            type="rotate"
                            values="0 12 12;360 12 12"
                          />
                        </path>
                        <path
                          stroke-dasharray="64"
                          stroke-dashoffset="64"
                          stroke-opacity=".3"
                          d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
                        >
                          <animate
                            fill="freeze"
                            attributeName="stroke-dashoffset"
                            dur="1.2s"
                            values="64;0"
                          />
                        </path>
                      </g>
                    </svg>
                  </el-icon>
                  刷新数据
                </el-dropdown-item>
                <el-dropdown-item command="showEndDate">
                  <el-icon>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="m22 5.72l-4.6-3.86l-1.29 1.53l4.6 3.86zM7.88 3.39L6.6 1.86L2 5.71l1.29 1.53zM12.5 8H11v6l4.75 2.85l.75-1.23l-4-2.37zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a9 9 0 0 0 0-18m0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7"
                      />
                    </svg>
                  </el-icon>
                  截止日期
                </el-dropdown-item>
                <el-dropdown-item command="logout">
                  <el-icon>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12 3c-4.625 0-8.442 3.507-8.941 8.001H10v-3l5 4l-5 4v-3H3.06C3.56 17.494 7.376 21 12 21c4.963 0 9-4.037 9-9s-4.037-9-9-9"
                      />
                    </svg>
                  </el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- 公告板 -->
    <NoticeBoard />

    <el-main class="dashboard-content">
      <!-- 横向导航栏 -->
      <el-menu
        mode="horizontal"
        :default-active="activeNav"
        @select="handleNavSelect"
        class="nav-bar"
      >
        <el-menu-item index="home"
          ><el-icon
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              >
                <path
                  stroke-dasharray="64"
                  stroke-dashoffset="64"
                  d="M13 3l6 6v12h-14v-18h8"
                >
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    dur="0.6s"
                    values="64;0"
                  />
                </path>
                <path
                  stroke-dasharray="14"
                  stroke-dashoffset="14"
                  stroke-width="1"
                  d="M12.5 3v5.5h6.5"
                >
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    begin="0.7s"
                    dur="0.2s"
                    values="14;0"
                  />
                </path>
                <path stroke-dasharray="4" stroke-dashoffset="4" d="M9 17v-3">
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    begin="0.9s"
                    dur="0.2s"
                    values="4;0"
                  />
                </path>
                <path stroke-dasharray="6" stroke-dashoffset="6" d="M12 17v-4">
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    begin="1.1s"
                    dur="0.2s"
                    values="6;0"
                  />
                </path>
                <path stroke-dasharray="6" stroke-dashoffset="6" d="M15 17v-5">
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    begin="1.3s"
                    dur="0.2s"
                    values="6;0"
                  />
                </path>
              </g></svg></el-icon
          >数据</el-menu-item
        >
        <el-menu-item index="records"
          ><el-icon
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              >
                <path
                  stroke-dasharray="72"
                  stroke-dashoffset="72"
                  d="M12 3h7v18h-14v-18h7Z"
                >
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    dur="0.6s"
                    values="72;0"
                  />
                </path>
                <path
                  stroke-dasharray="12"
                  stroke-dashoffset="12"
                  stroke-width="1"
                  d="M14.5 3.5v3h-5v-3"
                >
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    begin="0.7s"
                    dur="0.2s"
                    values="12;0"
                  />
                </path>
                <path stroke-dasharray="4" stroke-dashoffset="4" d="M9 10h3">
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    begin="0.9s"
                    dur="0.2s"
                    values="4;0"
                  />
                </path>
                <path stroke-dasharray="6" stroke-dashoffset="6" d="M9 13h5">
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    begin="1.1s"
                    dur="0.2s"
                    values="6;0"
                  />
                </path>
                <path stroke-dasharray="8" stroke-dashoffset="8" d="M9 16h6">
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    begin="1.3s"
                    dur="0.2s"
                    values="8;0"
                  />
                </path>
              </g></svg></el-icon
          >记录</el-menu-item
        >
      </el-menu>

      <!-- 根据导航项切换显示 -->
      <template v-if="activeNav === 'home'">
        <!-- 数据概述 -->
        <div class="stats-panel">
          <el-skeleton
            :loading="!activity || !runInfo || statsLoading"
            animated
          >
            <template #template>
              <el-row :gutter="16">
                <el-col :span="8">
                  <div class="stats-skeleton">
                    <el-skeleton-item
                      variant="text"
                      style="width: 30%; margin-bottom: 8px"
                    />
                    <el-skeleton-item variant="text" style="width: 50%" />
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stats-skeleton">
                    <el-skeleton-item
                      variant="text"
                      style="width: 30%; margin-bottom: 8px"
                    />
                    <el-skeleton-item variant="text" style="width: 50%" />
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stats-skeleton">
                    <el-skeleton-item
                      variant="text"
                      style="width: 30%; margin-bottom: 8px"
                    />
                    <el-skeleton-item variant="text" style="width: 50%" />
                  </div>
                </el-col>
              </el-row>
            </template>
            <template #default>
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-statistic
                    title="俱乐部完成率"
                    :value="activity?.joinNum || 0"
                    value-style="color: #409EFF;"
                  >
                    <template #suffix
                      >/{{
                        activity ? activity.totalNum.toFixed(0) : "0"
                      }}</template
                    >
                  </el-statistic>
                </el-col>
                <el-col :span="8">
                  <el-statistic
                    title="校园跑完成率"
                    :value="activity?.runJoinNum || 0"
                    value-style="color: #409EFF;"
                  >
                    <template #suffix
                      >/{{
                        activity ? activity.runTotalNum.toFixed(0) : "0"
                      }}</template
                    >
                  </el-statistic>
                </el-col>
                <el-col :span="8">
                  <el-statistic
                    title="里程完成率"
                    :value="
                      runInfo
                        ? +(runInfo.runValidDistance / 1000).toFixed(2)
                        : 0
                    "
                    value-style="color: #409EFF;"
                  >
                    <template #suffix>
                      /{{
                        runInfo
                          ? (runInfo.needRunDistance / 1000).toFixed(0)
                          : "0"
                      }}
                    </template>
                  </el-statistic>
                </el-col>
              </el-row>
            </template>
          </el-skeleton>
        </div>

        <!-- 提交新记录 -->
        <el-card class="submit-card">
          <el-form
            ref="formRef"
            :model="formState"
            :rules="rules"
            label-position="left"
            label-width="auto"
          >
            <el-row :gutter="16">
              <el-col :xs="24" :sm="12">
                <el-form-item label="跑步里程" prop="distance">
                  <el-input-number
                    v-model="formState.distance"
                    :min="distanceMin"
                    :max="distanceMax"
                    :controls="false"
                    style="width: 100%"
                    placeholder="请输入跑步里程（米）"
                  >
                    <template #append>米</template>
                  </el-input-number>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="跑步时长" prop="duration">
                  <el-input-number
                    v-model="formState.duration"
                    :min="timeMin"
                    :max="timeMax"
                    :controls="false"
                    style="width: 100%"
                    placeholder="请输入跑步时长（分钟）"
                  >
                    <template #append>分钟</template>
                  </el-input-number>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="地图选择" prop="route">
              <el-select
                v-model="formState.route"
                style="width: 100%"
                placeholder="请选择学校地图"
              >
                <el-option
                  v-for="map in getSchoolMaps()"
                  :key="map.value"
                  :label="map.label"
                  :value="map.value"
                />
              </el-select>
            </el-form-item>

            <div
              class="form-info"
              v-if="formState.distance && formState.duration"
            >
              <span :class="{ 'text-error': !paceLimit }">
                当前配速:
                {{
                  formState.distance === 0
                    ? "0:00"
                    : formatPace(formState.duration, formState.distance)
                }}/公里
              </span>
            </div>

            <div class="form-footer">
              <el-button
                type="text"
                @click="fillRandomData"
                :disabled="submitting"
                class="randomBtn"
              >
                随机填充
              </el-button>
              <el-button
                type="primary"
                @click="handleSubmit"
                :loading="submitting"
                class="submit-btn"
                style="width: 100%"
              >
                <el-icon style="margin-right: 10px"
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                  >
                    <mask id="lineMdCheckAll0">
                      <g
                        fill="none"
                        stroke="#fff"
                        stroke-dasharray="24"
                        stroke-dashoffset="24"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      >
                        <path d="M2 13.5l4 4l10.75 -10.75">
                          <animate
                            fill="freeze"
                            attributeName="stroke-dashoffset"
                            dur="0.4s"
                            values="24;0"
                          />
                        </path>
                        <path
                          stroke="#000"
                          stroke-width="6"
                          d="M7.5 13.5l4 4l10.75 -10.75"
                        >
                          <animate
                            fill="freeze"
                            attributeName="stroke-dashoffset"
                            begin="0.4s"
                            dur="0.4s"
                            values="24;0"
                          />
                        </path>
                        <path d="M7.5 13.5l4 4l10.75 -10.75">
                          <animate
                            fill="freeze"
                            attributeName="stroke-dashoffset"
                            begin="0.4s"
                            dur="0.4s"
                            values="24;0"
                          />
                        </path>
                      </g>
                    </mask>
                    <rect
                      width="24"
                      height="24"
                      fill="currentColor"
                      mask="url(#lineMdCheckAll0)"
                    /></svg></el-icon
                >提交记录
              </el-button>
            </div>

            <!-- 添加地图显示 -->
            <el-skeleton
              :loading="!formState.route"
              class="map-container"
              animated
            >
              <template #template>
                <div class="map-skeleton-content">
                  <el-icon class="map-skeleton-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                    >
                      <mask id="lineMdCompassLoop0">
                        <g
                          fill="none"
                          stroke="#fff"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                        >
                          <path
                            stroke-dasharray="64"
                            stroke-dashoffset="64"
                            d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
                          >
                            <animate
                              fill="freeze"
                              attributeName="stroke-dashoffset"
                              dur="0.6s"
                              values="64;0"
                            />
                          </path>
                          <path
                            fill="#fff"
                            stroke="none"
                            d="M11 11L12 12L13 13L12 12z"
                            transform="rotate(-180 12 12)"
                          >
                            <animate
                              fill="freeze"
                              attributeName="d"
                              begin="0.6s"
                              dur="0.3s"
                              values="M11 11L12 12L13 13L12 12z;M10.2 10.2L17 7L13.8 13.8L7 17z"
                            />
                            <animateTransform
                              attributeName="transform"
                              dur="9s"
                              repeatCount="indefinite"
                              type="rotate"
                              values="-180 12 12;0 12 12;0 12 12;0 12 12;0 12 12;270 12 12;-90 12 12;0 12 12;-180 12 12;-35 12 12;-40 12 12;-45 12 12;-45 12 12;-110 12 12;-135 12 12;-180 12 12"
                            />
                          </path>
                          <circle
                            cx="12"
                            cy="12"
                            r="1"
                            fill="#000"
                            fill-opacity="0"
                            stroke="none"
                          >
                            <animate
                              fill="freeze"
                              attributeName="fill-opacity"
                              begin="0.9s"
                              dur="0.15s"
                              values="0;1"
                            />
                          </circle>
                        </g>
                      </mask>
                      <rect
                        width="24"
                        height="24"
                        fill="currentColor"
                        mask="url(#lineMdCompassLoop0)"
                      />
                    </svg>
                  </el-icon>
                </div>
              </template>
              <template #default>
                <div v-show="formState.route" class="map-content">
                  <RunMap :map-choice="formState.route" :visible="showMap" />
                </div>
              </template>
            </el-skeleton>
          </el-form>
        </el-card>
      </template>

      <!-- 历史记录 -->
      <template v-else-if="activeNav === 'records'">
        <el-card
          class="records-card"
          v-loading="recordsLoading"
          element-loading-text="记录加载中"
        >
          <div class="records-list">
            <el-skeleton :loading="recordsLoading" animated :count="10">
              <template #template>
                <div style="padding: 2px">
                  <el-skeleton-item
                    variant="p"
                    style="width: 100%; height: 5px"
                  />
                </div>
              </template>
              <template #default>
                <el-table
                  :data="records"
                  v-if="records.length > 0"
                  table-layout="auto"
                  border
                  stripe
                  height="400px"
                  style="width: 100%"
                >
                  <el-table-column
                    prop="recordDate"
                    label="记录时间"
                    fixed
                    sortable
                    align="center"
                  />
                  <el-table-column
                    prop="defeatedInfo"
                    label="状态"
                    align="center"
                  >
                    <template #default="{ row }">
                      <div class="status-container">
                        <el-icon
                          :style="{
                            color:
                              row.defeatedInfo === '有效跑步'
                                ? '#409EFF'
                                : '#F56C6C',
                          }"
                        >
                          <component
                            :is="
                              row.defeatedInfo === '有效跑步'
                                ? SuccessFilled
                                : CircleCloseFilled
                            "
                          />
                        </el-icon>
                        {{ row.defeatedInfo }}
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    type="expand"
                    min-width="10"
                    label=""
                    align="center"
                  >
                    <template #default="{ row }">
                      <el-form
                        label-position="left"
                        inline
                        class="expanded-form"
                      >
                        <el-form-item label="跑步时长">
                          {{ row.runTime }} 分钟
                        </el-form-item>
                        <el-form-item label="跑步里程">
                          {{ (row.runDistance / 1000).toFixed(2) }} 公里
                        </el-form-item>
                        <el-form-item label="平均配速">
                          {{ formatPace(row.runTime, row.runDistance) }}
                        </el-form-item>
                      </el-form>
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-else description="暂无跑步记录" />
              </template>
            </el-skeleton>
          </div>

          <div class="pagination">
            <el-pagination
              :currentPage="pagination.current"
              :total="pagination.total"
              :page-size="pagination.pageSize"
              layout="prev, pager, next"
              @current-change="handleTableChange"
            />
          </div>
        </el-card>
      </template>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, h, computed, watch } from "vue";
import { useUserStore } from "@/stores/user";
import { useAuth } from "@/composables/useAuth";
import { useDashboard } from "@/composables/useDashboard";
import { useRunStandard } from "@/composables/useRunStandard";
import { formatPace } from "@/utils/format";
import { getSchoolMaps } from "@/utils/map";
import { useSubmitActivity } from "@/composables/useSubmitActivity";
import type { RunRecord } from "@/types/run";
import NoticeBoard from "@/components/NoticeBoard.vue";
import { config } from "@/config";
import { ElMessage } from "element-plus";
import {
  SuccessFilled,
  CircleCloseFilled,
  MagicStick,
} from "@element-plus/icons-vue";

import RunMap from "@/components/RunMap.vue";

const userStore = useUserStore();
const { logout } = useAuth();
const {
  loading: dashboardLoading,
  activity,
  runInfo,
  runStandardData,
  runDistanceMin,
  runDistanceMax,
  runTimeMin,
  runTimeMax,
  records,
  pagination,
  handleTableChange: fetchPageData,
  refreshData,
  initDashboard,
} = useDashboard();

const { submit: submitActivity, isSubmitting } = useSubmitActivity();

const activeNav = ref("home");
const handleNavSelect = (index: string) => {
  activeNav.value = index;
  // 可根据需求添加额外逻辑，如路由跳转
};
const { showEndDate } = useRunStandard();

const isDarkMode = ref(userStore.$state.isDarkMode);

const handleLogout = () => {
  logout();
};

const toggleTheme = () => {
  userStore.toggleDarkMode();
  isDarkMode.value = userStore.$state.isDarkMode;
};

const formRef = ref();
const submitting = ref(false);
const formState = reactive({
  distance: runDistanceMin.value,
  duration: runTimeMin.value,
  route: "",
});

// 添加地图显示控制
const showMap = ref(false);

// 监听路线选择变化
watch(
  () => formState.route,
  (newVal) => {
    if (newVal) {
      showMap.value = true;
    }
  }
);

// 计算配速限制
const paceLimit = computed(() => {
  if (!formState.distance || !formState.duration || formState.distance === 0)
    return true;
  const paceInMinutes = (formState.duration * 60) / (formState.distance / 1000);
  return !isNaN(paceInMinutes) && paceInMinutes >= 6;
});

// 获取里程和时间限制
const distanceMin = runDistanceMin.value;
const distanceMax = runDistanceMax.value + 2333;
const timeMin = runTimeMin.value;
const timeMax = runTimeMax.value + 23;

// 校验规则
const rules = {
  distance: [
    { required: true, message: "请输入跑步里程" },
    {
      type: "number",
      min: distanceMin,
      message: `最小里程为 ${distanceMin} 米`,
    },
    {
      type: "number",
      max: distanceMax,
      message: `最大里程为 ${distanceMax} 米`,
    },
  ],
  duration: [
    { required: true, message: "请输入跑步时长" },
    { type: "number", min: timeMin, message: `最小时长为 ${timeMin} 分钟` },
    { type: "number", max: timeMax, message: `最大时长为 ${timeMax} 分钟` },
  ],
  route: [{ required: true, message: "请选择学校地图" }],
};

const columns = [
  {
    title: "日期",
    dataIndex: "recordDate",
    key: "recordDate",
    width: 120,
  },
  {
    title: "里程",
    dataIndex: "runDistance",
    key: "runDistance",
    width: 100,
    align: "right" as const,
  },
  {
    title: "时长",
    dataIndex: "runTime",
    key: "runTime",
    width: 100,
    align: "right" as const,
  },
  {
    title: "配速",
    dataIndex: "runSpeed",
    key: "runSpeed",
    width: 100,
    align: "right" as const,
    customRender: ({ record }: { record: RunRecord }) =>
      formatPace(
        record.runValidTime || record.runTime,
        record.runValidDistance || record.runDistance
      ),
  },
  {
    title: "状态",
    dataIndex: "defeatedInfo",
    key: "defeatedInfo",
    customRender: ({ text, record }: { text: string; record: any }) =>
      h("span", [
        h({
          icon:
            record.runStatus === "1"
              ? "ph:check-circle-fill"
              : "ph:x-circle-fill",
          style: {
            color: record.runStatus === "1" ? "#52c41a" : "#ff4d4f",
            marginRight: "8px",
            fontSize: "16px",
            verticalAlign: "middle",
          },
        }),
        text,
      ]),
  },
];

const handleSubmit = async () => {
  try {
    await formRef.value.validate();

    if (!paceLimit.value) {
      ElMessage.error("配速不能小于6分钟/公里");
      return;
    }

    if (!userStore.userInfo?.userId) {
      ElMessage.error("用户信息不完整");
      return;
    }

    submitting.value = true;
    await submitActivity(
      formState.distance,
      formState.duration,
      formState.route,
      userStore.userInfo.userId
    );
    await refreshData();
  } catch (error) {
    console.error(error);
  } finally {
    submitting.value = false;
  }
};

const statsLoading = ref(true);
const recordsLoading = ref(true);

const handleCommand = (command: string) => {
  switch (command) {
    case "refresh":
      handleRefreshData();
      break;
    case "showEndDate":
      showEndDate();
      break;
    case "logout":
      handleLogout();
      break;
  }
};

// 添加随机填充函数
const fillRandomData = () => {
  let distance, time, pace;
  do {
    distance = Math.random() * (distanceMax - distanceMin) + distanceMin;
    time = Math.random() * (timeMax - timeMin) + timeMin;
    pace = time / (distance / 1000); // 计算配速
  } while (pace <= 6); // 确保配速大于6分钟每公里

  const maps = getSchoolMaps();
  const randomMapIndex = Math.floor(Math.random() * maps.length);

  formState.distance = Math.round(distance);
  formState.duration = Math.round(time);
  formState.route = maps[randomMapIndex].value;
};

const handleTableChange = async (currentPage: number) => {
  recordsLoading.value = true;
  try {
    await fetchPageData(currentPage);
  } finally {
    recordsLoading.value = false;
  }
};

const handleRefreshData = async () => {
  statsLoading.value = true;
  recordsLoading.value = true;

  try {
    await refreshData();
  } catch (error) {
    console.error("Failed to refresh data:", error);
    ElMessage.error("数据刷新失败");
  } finally {
    statsLoading.value = false;
    recordsLoading.value = false;
  }
};

onMounted(async () => {
  statsLoading.value = true;
  recordsLoading.value = true;
  try {
    await Promise.all([initDashboard()]);
  } catch (error) {
    console.error("Failed to load data:", error);
    ElMessage.error("数据加载失败");
  } finally {
    statsLoading.value = false;
    recordsLoading.value = false;
  }
});
</script>

<style scoped>
/* 设置描述列表中的标签宽度 */
:deep(.el-descriptions__label) {
  width: 80px !important;
  text-align: right !important;
}

/* 确保内容区域正确对齐 */
:deep(.el-descriptions__content) {
  padding-left: 12px !important;
}

.status-container {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  /* 确保最小宽度一致 */
}

/* 确保图标大小一致 */
.status-container .el-icon {
  font-size: 16px;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.dashboard-container {
  min-height: 100vh;
  background-color: var(--dashboard-container-bg-color);
  align-content: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.dashboard-header {
  background: var(--dashboard-container-bg-color);
  border-radius: 50px;
  margin: 10px 0 5px 0;
  height: 40px;
  min-width: 300px;
  max-width: 800px;
  box-shadow: var(--dashboard-header-box-shadow);
  border: var(--dashboard-header-border);
  transition: all 0.3s ease;
}

.dashboard-header:hover {
  transform: translateY(-2px);
}
.dashboard-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  height: 100%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-text);
  cursor: pointer;
  border: none;
}

.settings-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
  flex-direction: column;
  align-items: center;
}

.dashboard-content {
  padding: 16px 24px;
  max-width: 800px;
  background-color: var(--dashboard-content-bg-color);
  border: var(--dashboard-content-border);
  border-radius: 20px;
  margin: 2px 20px 50px 20px;
  box-shadow: var(--dashboard-content-box-shadow);
  transition: all 0.3s ease;
}
.dashboard-content:hover {
  transform: translateY(-2px);
}

/* 数据状态板 */
.stats-panel {
  text-align: center;
  padding: 15px 0 5px 0;
  color: var(--el-text-color-primary);
  overflow: hidden;
  position: relative;
  margin: 15px 10px 5px 10px;
}

.stats-skeleton {
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 提交表单卡片 */
.submit-card {
  background-color: var(--submit-card-bg-color);
  border: var(--submit-card-border);
  box-shadow: var(--submit-card-box-shadow);
  border-radius: 0px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  transition: none;
}

/* 记录表格卡片 */
.records-card {
  background-color: var(--records-card-bg-color);
  box-shadow: none;
  border: none;
  color: var(--el-text-color-primary);
  overflow: hidden;
  transition: none;
  position: relative;
  height: auto;
}

.add-record-btn {
  margin-bottom: 10px;
}

.logo {
  height: 24px;
  width: 24px;
  margin-right: 24px;
  object-fit: contain;
  cursor: pointer;
  filter: brightness(var(--logo-value));
}

.nav-bar {
  margin: 0 10px;
  align-items: center;
  justify-content: center;
  height: 30px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  background-color: var(--secondary-bg);
}

.record-status {
  display: inline-flex;
  align-items: center;
  color: var(--primary-text);
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
}

.form-info {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-align: left;
  transition: all 0.3s;
}

.form-footer {
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  display: flex;
}

.randomBtn {
  color: var(--el-text-color-secondary);
  width: 100%;
}

.text-error {
  color: var(--el-color-danger);
}

.header-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 4px;
  color: var(--el-text-color-primary);
  transition: all 0.3s;
}

.header-icon-button:hover {
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

.map-container {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  overflow: hidden;
  height: 300px;
  margin: 16px 0;
}

.map-skeleton-content {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color-light);
  height: 100%;
}

.map-skeleton-icon {
  font-size: 48px;
  color: var(--el-text-color-placeholder);
}

.el-table {
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: var(--el-fill-color-light);
  margin-bottom: 16px;
}

.status-container {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.status-container .el-icon {
  font-size: 16px;
}

.expanded-form {
  padding: 16px;
}

.expanded-form :deep(.el-form-item) {
  margin-right: 32px;
  margin-bottom: 0;
}

.expanded-form :deep(.el-form-item__label) {
  color: var(--el-text-color-secondary);
}
</style>