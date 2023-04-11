<a name="TOC"></a>

<h3 align="center">
  ESPORT NOTIFIER
</h3>

<div align="center">
  <a href="https://nodejs.org/en/"><img src="https://img.shields.io/badge/made%20with-javascript-1f425f?logo=javascript&.svg" /></a>
  <a href="https://www.google.com/script/start/"><img src="https://img.shields.io/badge/apps%20script-4285F4?logo=google&logoColor=white" /></a>
  <a href="https://github.com/lucasvtiradentes/twitch-notifier#contributing"><img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat" alt="contributions" /></a>
</div>

<p align="center">
  <a href="#dart-features">Features</a> • <a href="#warning-requirements">Requirements</a> • <a href="#bulb-usage">Usage</a> • <a href="#books-about">About</a>
</p>

<details>
  <summary align="center"><span>see <b>table of content</b></span></summary>
  <p align="center">
    <ul>
      <!-- <li><a href="#trumpet-overview">Overview</a></li> -->
      <!-- <li><a href="#pushpin-table-of-contents">TOC</a></li> -->
      <li><a href="#dart-features">Features</a></li>
      <li><a href="#warning-requirements">Requirements</a></li>
      <li>
        <a href="#bulb-usage">Usage</a>
        <ul>
          <li><a href="#how-it-works">How it works?</a></li>
          <li><a href="#installation">Installation</a></li>
          <li><a href="#uninstall">Uninstall</a></li>
        </ul>
      </li>
      <li>
        <a href="#books-about">About</a>
        <ul>
          <li><a href="#license">License</a></li>
          <li><a href="#contributing">Contributing</a></li>
          <li><a href="#feedback">Feedback</a></li>
        </ul>
      </li>
    </ul>
  </p>
</details>

<a href="#"><img src="./.github/images/divider.png" /></a>

## :trumpet: Overview

Get a daily email informing what are the today matches of your favorite teams in a bunche of esports games, including [csgo](https://www.counter-strike.net/), [valorant](https://playvalorant.com/) and [league of legends](https://www.leagueoflegends.com/).

<div align="center">
  <table align="center">
    <thead>
      <tr>
        <td><p align="center">Desktop view</p></td>
        <td><p align="center">Mobile view</p></td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><img width="100%" src="./.github/images/desktop.png"></td>
        <td><img width="200px" src="./.github/images/mobile.jpeg"></td>
      </tr>
    </tbody>
 </table>
</div>

## :dart: Features<a href="#TOC"><img align="right" src="./.github/images/up_arrow.png" width="22"></a>

&nbsp;&nbsp;&nbsp;✔️ get daily email informing what are your favorite teams today matches;<br>
&nbsp;&nbsp;&nbsp;✔️ select the games you are interested in to check for matches;<br>
&nbsp;&nbsp;&nbsp;✔️ specify the time to send the daily email;<br>
&nbsp;&nbsp;&nbsp;✔️ option to informe matches about only the current date or also from the following days.<br>

Also it is worth mentioning that the tool informs about the following games:

- [x] [counter-strike global offense](https://liquipedia.net/counterstrike/Liquipedia:Matches)
- [x] [valorant](https://www.vlr.gg/matches)
- [x] [rainbow six siege](https://siege.gg/matches)
<!-- - [ ] overwatch 2
- [ ] dota 2
- [ ] league of legends
- [ ] free fire
- [ ] rocket league
- [ ] call of duty -->

## :warning: Requirements<a href="#TOC"><img align="right" src="./.github/images/up_arrow.png" width="22"></a>

The only thing you need to use this solution is a `gmail/google account`.

## :bulb: Usage<a href="#TOC"><img align="right" src="./.github/images/up_arrow.png" width="22"></a>

### How it works

It basically sets a function to run in google apps scripts to run everyday at a specified time, and this function is responsable for:

- get all the the matches scheduled for the next couple of days in all games that you're interested in;
- filter the matches list to get only the ones about your favorite teams;
- if there's at least one game of your favorite teams, send you an email about informing the details.

### Installation

To effectively use this project, do the following steps:

<details>
  <summary>1 - create a Google Apps Scripts (GAS) project</summary>
  <div>
    <br>
    <p>Go to the <a href="">google apps script</a> and create a new project by clicking in the button showed in the next image.<br>
    It would be a good idea to rename the project to something like "esports-notifier".</p>
    <p align="center"><img width="500" src="./.github/images/tutorial/tut2.png" /></p>
  </div>
</details>

<details>
  <summary>2 - setup the esports-notifier on GAS</summary>
  <div>
    <br>
    <p>Click on the initial file, which is the <b>rectangle-1</b> on the image.</p>
    <p align="center"><img width="500" src="./.github/images/tutorial/tut3.png" /></p>
    <p>Replace the initial content present in the <b>rectangle-2</b> with the content present in <a href="./src/notifier.js">notifier.js</a>.</p>
    <blockquote>
      <p><span>⚠️ Warning</span><br>
       Remember to update the <code>CONFIGS</code> object according to your data and needs.</p>
    </blockquote>
  </div>
</details>

<details>
  <summary>3 - allow the required google permissions</summary>
  <div>
    <br>
    <p>Go to the project settings by clicking on the <b>first image rectangle</b>. After that, check the option to show the <code>appsscript.json</code> in our project, a file that manages the required google api access.</p>
    <div align="center">
      <table>
        <tr>
          <td width="400">
            <img width="400" src="./.github/images/tutorial/tut4.1.png" />
          </td>
          <td width="400">
            <img width="400" src="./.github/images/tutorial/tut4.2.png" />
          </td>
        </tr>
      </table>
    </div>
    <p>Go back to the project files, and replace the content present in the <code>appsscript.json</code> with the following code:</p>    <p align="center"><img width="500" src="./.github/images/tutorial/tut5.png" /></p>
    <pre>
<!-- <DYNFIELD:GAS_APPSSCRIPT> -->
{
  "timeZone": "Etc/GMT",
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "Cheerio",
        "version": "14",
        "libraryId": "1ReeQ6WO8kKNxoaA_O0XEQ589cIrRvEBA9qcWpNqdOP17i47u6N9M5Xh0"
      }
    ]
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.scriptapp",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/userinfo.email"
  ],
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
<!-- </DYNFIELD:GAS_APPSSCRIPT> -->
</pre>
  </div>
</details>

<details>
  <summary>4 - setup the twitch-notifier to run automatically every x minutes</summary>
  <div>
    <br>
    <p>Just follow what the bellow image shows, which is to select the <code>setup</code> function and run it.<br>
    After, a popup will appear asking your permission, and you'll have to accept it.</p>
    <p align="center"><img width="500" src="./.github/images/tutorial/tut6.webp" /></p>
  </div>
</details>

### Uninstall

If you want to receive the daily emails, just go to the GAS respective project and run the function called "uninstall".

By doing that, the GAS trigger responsable for running everyday the function will be deleted.

<a href="#"><img src="./.github/images/divider.png" /></a>

## :books: About<a href="#TOC"><img align="right" src="./.github/images/up_arrow.png" width="22"></a>

## License

This project is distributed under the terms of the MIT License Version 2.0. A complete version of the license is available in the [LICENSE](LICENSE) file in this repository. Any contribution made to this project will be licensed under the MIT License Version 2.0.

## Feedback

Any questions or suggestions? You are welcome to discuss it on:

- [Github issues](https://github.com/lucasvtiradentes/twitch-notifier/issues)
- [Email](mailto:lucasvtiradentes@gmail.com)

<a href="#"><img src="./.github/images/divider.png" /></a>

<div align="center">
  <p>
    <a target="_blank" href="https://www.linkedin.com/in/lucasvtiradentes/"><img src="https://img.shields.io/badge/-linkedin-blue?logo=Linkedin&logoColor=white" alt="LinkedIn"></a>
    <a target="_blank" href="mailto:lucasvtiradentes@gmail.com"><img src="https://img.shields.io/badge/gmail-red?logo=gmail&logoColor=white" alt="Gmail"></a>
    <a target="_blank" href="https://discord.com/users/262326726892191744"><img src="https://img.shields.io/badge/discord-5865F2?logo=discord&logoColor=white" alt="Discord"></a>
    <a target="_blank" href="https://github.com/lucasvtiradentes/"><img src="https://img.shields.io/badge/github-gray?logo=github&logoColor=white" alt="Github"></a>
  </p>
  <p>Made with ❤️ by <b>Lucas Vieira</b></p>
  <p>👉 See also all <a href="https://github.com/lucasvtiradentes/lucasvtiradentes/blob/master/portfolio/PROJECTS.md#TOC">my projects</a></p>
  <p>👉 See also all <a href="https://github.com/lucasvtiradentes/my-tutorials/blob/master/README.md#TOC">my articles</a></p>
</div>
