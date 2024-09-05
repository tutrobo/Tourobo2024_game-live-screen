import * as ROSLIB from '@tier4/roslibjs-foxglove';
import hexRgb from 'hex-rgb';
import { colors } from './colors';
import { type Match, type Time, Winner } from './msg';
import { p5 } from './p5';

import './style.css';

import BIZUDPGothic_BoldSrc from './assets/BIZUDPGothic-Bold.ttf';
import SUSE_BoldSrc from './assets/SUSE-Bold.ttf';
import { univShortNames } from './univ-short-names';

let BIZUDPGothic_Bold: p5.Font;
let SUSE_Bold: p5.Font;

let count = 0;

let match: Match | null = null;

match = {
  id: '',
  title: '',

  start_time: { sec: 0, nanosec: 0 },
  end_time: { sec: 0, nanosec: 0 },

  red_team: {
    name: 'R.U.R',
    id: '',
    university: '東京農工大学',
    is_auto: false,

    seedlings: 0,
    immigration: false,
    type_1_a: true,
    type_1_b: false,
    type_2: false,
    v_goal: false,

    score: 0,
  },
  blue_team: {
    name: '',
    id: '',
    university: '',
    is_auto: false,

    seedlings: 0,
    immigration: false,
    type_1_a: false,
    type_1_b: true,
    type_2: false,
    v_goal: false,

    score: 0,
  },

  winner: Winner.UNKNOWN,
};

const ros = new ROSLIB.Ros({ url: 'ws://192.168.0.118:8765' });
const matchSub = new ROSLIB.Topic<Match>({
  ros,
  name: '/match/status',
  messageType: 'game_state_interfaces/msg/Match',
});
matchSub.subscribe((msg) => {
  match = msg;
});

// matchSub.unsubscribe();
// ros.close();

new p5((p: p5) => {
  p.preload = () => {
    BIZUDPGothic_Bold = p.loadFont(BIZUDPGothic_BoldSrc);
    SUSE_Bold = p.loadFont(SUSE_BoldSrc);
  };

  p.setup = () => {
    p.createCanvas(1920, 1080);
  };

  p.draw = () => {
    p.clear();
    p.strokeWeight(0);

    if (match) {
      // 赤チーム
      drawRect(p, 0, 0, 600, 100, colors.red);
      drawRect(p, 0, 100, 600, 200, `${colors.white}cc`, [0, 0, 80, 0]);
      drawRect(
        p,
        600 - 160,
        100,
        160,
        80,
        match.red_team.is_auto ? colors.green : colors.yellow,
        [0, 0, 0, 20],
      ); // yellow 8
      drawText(
        p,
        `${match.red_team.name} (${univShortNames[match.red_team.university]})`,
        20,
        50,
        {
          size: 40,
          horizAlign: p.LEFT,
          vertAlign: p.CENTER,
          color: colors.white,
          font: BIZUDPGothic_Bold,
        },
      );
      drawText(p, `${match.red_team.score}`, 250, 200 - 20, {
        size: 120,
        horizAlign: p.CENTER,
        vertAlign: p.CENTER,
        color: colors.black,
        font: SUSE_Bold,
      });
      drawText(p, match.red_team.is_auto ? '自動' : '手動', 600 - 80, 136, {
        size: 50,
        horizAlign: p.CENTER,
        vertAlign: p.CENTER,
        color: colors.white,
        font: BIZUDPGothic_Bold,
      });

      // 青チーム
      drawRect(p, p.width - 600, 0, 600, 100, colors.blue);
      drawRect(
        p,
        p.width - 600,
        100,
        600,
        200,
        `${colors.white}cc`,
        [0, 0, 0, 80],
      );
      drawRect(
        p,
        p.width - 600,
        100,
        160,
        80,
        match.blue_team.is_auto ? colors.green : colors.yellow,
        [0, 0, 20, 0],
      );
      drawText(
        p,
        `${match.blue_team.name} (${univShortNames[match.blue_team.university]})`,
        p.width - 20,
        50,
        {
          size: 40,
          horizAlign: p.RIGHT,
          vertAlign: p.CENTER,
          color: colors.white,
          font: BIZUDPGothic_Bold,
        },
      );
      drawText(p, `${match.blue_team.score}`, p.width - 250, 200 - 20, {
        size: 120,
        horizAlign: p.CENTER,
        vertAlign: p.CENTER,
        color: colors.black,
        font: SUSE_Bold,
      });
      drawText(
        p,
        match.blue_team.is_auto ? '自動' : '手動',
        p.width - 600 + 80,
        136,
        {
          size: 50,
          horizAlign: p.CENTER,
          vertAlign: p.CENTER,
          color: colors.white,
          font: BIZUDPGothic_Bold,
        },
      );

      // 中央タイマーなど
      drawRect(
        p,
        p.width / 2 - 250,
        0,
        500,
        200,
        `${colors.black}ee`,
        [0, 0, 20, 20],
      );
      drawText(
        p,
        isRosTimeZero(match.start_time)
          ? `${msToText(rosTimeToMs(match.start_time))}`
          : `${msToText(Date.now() - rosTimeToMs(match.start_time))}`,
        p.width / 2,
        100 - 20,
        {
          size: 120,
          horizAlign: p.CENTER,
          vertAlign: p.CENTER,
          color: colors.white,
          font: SUSE_Bold,
        },
      );
      // ポール
      drawCircle(
        p,
        p.width / 2 + 250 - 40,
        40,
        20,
        match.red_team.type_1_a
          ? colors.red
          : match.blue_team.type_1_a
            ? colors.blue
            : colors.white,
      );
      drawCircle(
        p,
        p.width / 2 + 250 - 40,
        100,
        20,
        match.red_team.type_2
          ? colors.red
          : match.blue_team.type_2
            ? colors.blue
            : colors.white,
      );
      drawCircle(
        p,
        p.width / 2 + 250 - 40,
        160,
        20,
        match.red_team.type_1_b
          ? colors.red
          : match.blue_team.type_1_b
            ? colors.blue
            : colors.white,
      );
    }

    // 下部インフォメーション
    drawRect(p, 0, p.height - 150, p.width, 150, colors.white);
    drawText(
      p,
      match?.title ?? '任意のメッセージを出せるようにする',
      20,
      p.height - 75,
      {
        size: 50,
        horizAlign: p.LEFT,
        vertAlign: p.CENTER,
        color: colors.black,
        font: BIZUDPGothic_Bold,
      },
    );
    count++;
  };

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
}, document.querySelector<HTMLDivElement>('#app')!);

function drawRect(
  p: p5,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  br?: [number, number, number, number],
) {
  const { red, green, blue, alpha } = hexRgb(color);
  p.fill(red, green, blue, 255 * alpha);
  if (br) {
    p.rect(x, y, w, h, ...br);
  } else {
    p.rect(x, y, w, h);
  }
}

function drawCircle(p: p5, x: number, y: number, r: number, color: string) {
  const { red, green, blue, alpha } = hexRgb(color);
  p.fill(red, green, blue, 255 * alpha);
  p.circle(x, y, r * 2);
}

function drawText(
  p: p5,
  text: string,
  x: number,
  y: number,
  options: {
    size: number;
    horizAlign: p5.HORIZ_ALIGN;
    vertAlign: p5.VERT_ALIGN;
    color: string;
    font: p5.Font;
  },
) {
  const { red, green, blue, alpha } = hexRgb(options.color);
  p.textSize(options.size);
  p.textAlign(options.horizAlign, options.vertAlign);
  p.fill(red, green, blue, 255 * alpha);
  p.textFont(options.font);
  p.text(text, x, y);
}

function rosTimeToMs(time: Time) {
  return time.sec * 1000 + time.nanosec / 1000000;
}

function isRosTimeZero(time: Time) {
  return time.sec === 0 && time.nanosec === 0;
}

function msToText(ms: number) {
  const sec = Math.floor(ms / 1000);
  return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
}
