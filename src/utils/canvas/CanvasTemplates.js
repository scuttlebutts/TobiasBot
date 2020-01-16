const { createCanvas, Image } = require("canvas");

const CanvasUtils = require("./CanvasUtils.js");
const Constants = require("../Constants.js");
const Color = require("../Color.js");
const Utils = require("../");

module.exports = class CanvasTemplates {
  static async levelUpdated(user, t, { level, background }) {
    const WIDTH = 150;
    const HEIGHT = 150;

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    const IMAGE_ASSETS = Promise.all([
      Image.from(user.displayAvatarURL),
      Image.from(background),
      Image.from('src/assets/img/jpg/levelup-brands-background.jpg')
    ])

    const [avatarImage, backgroundImage, levelBackground] = await IMAGE_ASSETS;

    // Layout

    ctx.drawImage(backgroundImage, 0, 0, WIDTH, HEIGHT);
    ctx.drawBlurredImage(levelBackground, 4, 0, HEIGHT - 60, WIDTH, 60);

    ctx.fillStyle = 'rgba(250, 250, 250, .5)';
    ctx.fillRect(0, HEIGHT - 60, WIDTH, 60)

    ctx.fillStyle = Constants.FAV_COLOR;
    ctx.fillRect(0, (HEIGHT - 60) - 2, WIDTH, 4);

    // Logo

    const LOGO_SIZE = 60;

    ctx.fillStyle = '#FFF';
    ctx.fillRect(((WIDTH - LOGO_SIZE) / 2) - 2, 8, LOGO_SIZE + 4, LOGO_SIZE + 4)

    ctx.drawImage(avatarImage, (WIDTH - LOGO_SIZE) / 2, 10, LOGO_SIZE, LOGO_SIZE);

    // Level Texts

    const blockSizeInsert = 5;

    const textLevelUpedMeasure = CanvasUtils.measureText(ctx, '22px Bebas Neue', 'SUBIU DE NIVEL');
    const blockAlign = CanvasUtils.resolveAlign(WIDTH / 2, 100, textLevelUpedMeasure.width + blockSizeInsert, textLevelUpedMeasure.height + blockSizeInsert, 2);

    ctx.fillStyle = 'rgba(0, 0, 0, .3)';
    ctx.fillRect(blockAlign.x, (blockAlign.y - textLevelUpedMeasure.height) - (blockSizeInsert * 1.5), textLevelUpedMeasure.width + blockSizeInsert, textLevelUpedMeasure.height + blockSizeInsert)

    ctx.fillStyle = '#FFF';
    ctx.write(t('commons:economy.leveluped'), WIDTH / 2, 100, '22px Bebas Neue', 2);

    //

    const font = 'italic 22px Lemon Milk Bold';

    const space = CanvasUtils.measureText(ctx, font, ' ');
    const textLevelBrandMeasure = CanvasUtils.measureText(ctx, font, t('commons:economy.lvl'));
    const textLevelNumberMeasure = CanvasUtils.measureText(ctx, font, level);

    ctx.fillStyle = '#000';
    const levelBrand = ctx.write(t('commons:economy.lvl'), ((WIDTH - textLevelNumberMeasure.width) - space.width) / 2, 125, font, 2);

    ctx.fillStyle = '#1500ff';
    ctx.fillText(level, levelBrand.leftX + textLevelBrandMeasure.width + space.width, levelBrand.bottomY)

    return canvas.toBuffer()
  }

  static async profile(user, t, { background, pocket, level, rep, xp, favColor, levels }, rank) {
    const WIDTH = 800;
    const HEIGHT = 700;

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    const IMAGE_ASSETS = Promise.all([
      Image.from('src/assets/img/png/profile.png'),
      Image.from(background),
      Image.from(user.displayAvatarURL),
    ])

    const FAV_COLOR = new Color(favColor).rgb();
    const FAV_COLOR_RGBA = new Color(favColor).setAlpha(.5).rgba(false);

    // Draw

    const [Source, backgroundImage, avatarImage] = await IMAGE_ASSETS;

    const LOGO_SIZE = 200;
    const LOGO_BORDER = 10;
    const LOGO_X = 50;
    const LOGO_Y = 100;

    ctx.drawBlurredImage(backgroundImage, 5, 0, 0, WIDTH, HEIGHT);
    ctx.drawImage(Source, 0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = FAV_COLOR;
    ctx.roundFill(LOGO_X, LOGO_Y, LOGO_SIZE + LOGO_BORDER, LOGO_SIZE + LOGO_BORDER);
    ctx.roundImage(avatarImage, LOGO_X + (LOGO_BORDER / 2), LOGO_Y + (LOGO_BORDER / 2), LOGO_SIZE, LOGO_SIZE);

    const REP_WIDTH = 283.5;
    const REP_HEIGHT = 80;
    const REP_X = 20;
    const REP_Y = 335;

    ctx.fillStyle = FAV_COLOR_RGBA;
    ctx.fillRect(REP_X, REP_Y, REP_WIDTH, REP_HEIGHT)

    const BAR_WIDTH = 390;
    const BAR_HEIGHT = 56;
    const BAR_X = 340;
    const BAR_Y = 334;

    const perXP = levels.pop();
    const realXp = perXP.level > 1 ? xp - Utils.XPtoNextLevel(level - 1) : xp;

    const BAR = BAR_WIDTH / (perXP.maxXp / realXp);

    ctx.fillStyle = FAV_COLOR_RGBA// 'rgba(255, 255, 255, .8)';
    ctx.fillRect(BAR_X + 10, BAR_Y + 10, BAR > 10 ? BAR : 10, 40);

    // Texts

    const normalFont = (size = '36px') => `${size} Lemon Milk Light`;
    const italicFont = (size = '36px') => `italic ${size} Montserrat'`;
    const bolderFont = (size = '36px') => `${size} Montserrat ExtraBold`;
    const bolderItalicFont = (size = '36px') => `italic ${size} Montserrat ExtraBold`;

    const USERNAME_X = 430;
    const USERNAME_Y = 278;
    const TAG_X = 660;
    const TAG_Y = 206;

    ctx.fillStyle = '#FFF';
    ctx.write(user.username, WIDTH - USERNAME_X, USERNAME_Y, bolderItalicFont(), 8);
    ctx.write(user.discriminator, TAG_X, TAG_Y, bolderItalicFont(), 8)

    const XP_TEXT = `XP: ${realXp} / ${perXP.maxXp}`;

    const XPTextMeasure = CanvasUtils.measureText(ctx, normalFont(), XP_TEXT);
    const XPTextAlign = CanvasUtils.resolveAlign(BAR_X / 2, BAR_Y, XPTextMeasure.width, XPTextMeasure.height, 9);

    ctx.fillStyle = '#000';
    ctx.write(XP_TEXT, BAR_X + (XPTextAlign.x * 1.5), BAR_Y + (BAR_HEIGHT / 3) - 6, normalFont(), 1);

    const REP_TEXT = `+${rep}`;
    const REPTextMeasure = CanvasUtils.measureText(ctx, bolderFont, REP_TEXT);

    ctx.fillStyle = '#FFF';
    ctx.write(REP_TEXT, (REP_WIDTH + (REP_X * 2) + REPTextMeasure.width) / 2, REP_Y + (REP_HEIGHT / 2), bolderFont(), 4)

    const PROFILE_INFO_TITLE_X = 480;
    const PROFILE_INFO_X = 630;

    ctx.fillStyle = '#000';
    ctx.write(t('commons:economy.totalXp'), PROFILE_INFO_TITLE_X, 440, bolderFont('24px'))
    ctx.write(t('commons:economy.pockets'), PROFILE_INFO_TITLE_X, 485, bolderFont('24px'))
    ctx.write(t('commons:economy.rank'), PROFILE_INFO_TITLE_X, 530, bolderFont('24px'))

    ctx.fillStyle = FAV_COLOR;
    ctx.write(xp, PROFILE_INFO_X, 440, bolderItalicFont('32px'));
    ctx.write(pocket, PROFILE_INFO_X, 485, bolderItalicFont('32px'));
    ctx.write(rank, PROFILE_INFO_X, 530, bolderItalicFont('32px'));

    const LEVEL_X = 310;
    const LEVEL_Y = 450;

    ctx.fillStyle = '#FFF';
    const LEVEL_LABEL = ctx.write(t('commons:economy.level'), LEVEL_X, LEVEL_Y, bolderFont('40px'));

    const LEVEL_TEXT = level;
    const LevelNumberTextMeasure = CanvasUtils.measureText(ctx, bolderFont, LEVEL_TEXT);

    ctx.fillStyle = FAV_COLOR;
    ctx.write(LEVEL_TEXT, (LEVEL_LABEL.width + (LEVEL_X * 2) + LevelNumberTextMeasure.width) / 2, LEVEL_LABEL.bottomY + 40, bolderFont('60px'), 4)

    return canvas.toBuffer()
  }
}