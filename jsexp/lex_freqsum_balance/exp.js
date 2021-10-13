// lex_freqsum_balance
//
// 語彙決定課題(総出現頻度を揃えた漢字呈示)
// 条件は差大(ターゲットと同音異義語の出現頻度の差が大きい)・差小・なしの3つ
// 2014年11月24・25・26・28日 松井が実施

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "lex_freqsum_balance";	// 結果データを保存するディレクトリ名に使われる
    var id, sex;	// 参加者情報
    var b = 0;		// 実行中のblock番号(0からblocks.length-1まで)
    var block;		// 実行中のblock
    var t = 0;		// 実行中のtrial番号(0からblock.trials.length-1まで)
    var trial;		// 実行中のtrial
    var start_time;
    var end_time;

    // ***** 実験固有の変数・定数
    var T_FIX = 500;		// 注視点呈示時間(ms)
    var T_BLANK = 200;		// 注視点から刺激までのISI(ms)
    var T_ITI = 1000;		// 試行間間隔(ms)
    var T_CONTEXT = 2000;	// 文脈刺激呈示時間(ms)
    var T_FEEDBACK = 500;	// フィードバック(ms)
    var ID_MAIN = "main";	// 表示領域のID
    var MAIN_WIDTH = "800px";	// 表示領域の幅
    var MAIN_HEIGHT = "400px";	// 表示領域の高さ
    var MAIN_PADDING = "40px";	// 表示領域周囲の余白
    var CYAN = "#00FFFF";	// 表示領域の背景色
    var WHITE = "#FFFFFF";	// 表示領域の背景色
    var ID_CENTER = "center";	// 刺激呈示領域のID
    var CENTER_WIDTH = "400px";	// 刺激呈示領域の幅
    var CENTER_HEIGHT = "80px";	// 刺激呈示領域の高さ
    var CENTER_FONTSIZE = "36px";	// 刺激呈示領域のフォントサイズ

    var KEY_YES = IO.KEYCODE.J;
    var KEY_NO = IO.KEYCODE.F;
    var CORRECT = "correct";
    var ERROR = "error";

    var PRACTICE = "practice";
    var EXPERIMENT = "experiment";
    var LARGE = "large";
    var SMALL = "small";
    var NONE = "none";
    var NONWORD = "nonword";

    var SHOW_CONTEXT = undefined;	// trueならば文脈表示
		    // 被験者番号に応じてprologueで決定

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)

    // ***** ブロック・試行・刺激の定義

    var make_trials = function(set) {
	var trials = [];
	set.forEach(function(subset) {
	    var type = subset[0];
	    subset[1].split(" ").forEach(function(target) {
		trials.push({ type: type,
			      target: target,
			      result: undefined,
			      rt: undefined
			    });
	    });
	});
	return trials;
    };

    var practice_set = [
	[LARGE, "倉庫 趣味 限度"],
	[SMALL, "脳波 雷雨 構造"],
	[NONE, "郷土 旅費 庭園 詳細"],
	[NONWORD, "注客 約駐 濃義 食続 遠徳 教来 辺増 治泊 差県 直煙"]];

    var experiment_set = [
	[LARGE, "機体 委員 好意 賛成 定価 抗議 行進 決勝 好調 改定 下降 高級 四季 闘争 深刻 世紀 休演 言及 配線 冒頭 回帰 同様 手動 伝統"],
	[SMALL, "期間 党首 同行 講師 志向 解説 有効 戦闘 高速 書記 革新 想像 要旨 光景 投稿 上院 待機 干渉 高額 街頭 強要 膨張 単価 容量"],
	[NONE, "減税 採択 模様 著書 画面 妥協 海軍 農村 議題 懇談 貨物 任務 発電 着陸 体育 出現 異論 利率 役人 薬品 石炭 作曲 屋上 経歴"],
	[NONWORD, "移述 長閣 災明 種衆 資常 神縦 敬島 毒結 境座 射洗 樹益 留最 縮若 語追 裁見 秋筆 脱候 産逃 中離 観質 保審 知越 聴路 計通 田素 艦美 的廃 粉室 後然 陳源 白選 重番 多絶 適延 将取 丸欲 尊次 橋鳥 諸部 参実 管露 感宿 住望 気政 特窓 民喜 領給 問色 今立 得外 連状 買氏 宗抜 岸時 飛事 起府 表船 詰水 普港 許社 分場 編過 法能 木所 無馬 風地 条公 本具 暖数 真態 帳等 初理"]];

    var blocks = [
	{ name: "練習",
	  type: PRACTICE,
	  trials: make_trials(practice_set) },
	{ name: "本試行",
	  type: EXPERIMENT,
	  trials: make_trials(experiment_set) }
	];

    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
	var setup = function () {
	    b = 0;
	};
	var set_screen = function () {
	    IO.clear(ID_MAIN);
            IO.display_instruction("【語彙判断実験】",
                                    ["呈示場所を示す＋マークが２つ呈示された後，その場所に１つの単語が呈示されます。その単語が実在する単語の場合は右手の人差し指で【J】のキーを，実在しない非単語の場合は左手の人差し指で【F】のキーを，できるだけ早く正確に押してください。キーを押すと正解なら○，不正解なら×が表示され，しばらくすると，次の試行が呈示されます。"],
                                   ID_MAIN);
	};

	setup();
	set_screen();
	return block_prologue();
    };

    // ***** ブロックごとの開始時に実施する処理
    // ブロックごとの教示・試行実施順の決定など
    // do_first_trialを呼ぶこと
    var block_prologue = function () {
	var setup = function () {
	    block = blocks[b];
	    t = 0;
	    block.trials.shuffle();
	};

	setup();
	IO.append_paragraph("スペースキーを押すと" + block.name + "を開始します。全部で" + block.trials.length + "試行あります。",
			    ID_MAIN, { textAlign: "center" });
	IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
    };

    // ***** ブロック最初の試行に先立って実施する処理
    // 表示領域の準備など
    // do_trialを呼ぶこと
    var do_first_trial = function () {
	var set_screen = function () {
	    IO.clear(ID_MAIN);
	    IO.set_element_style(ID_MAIN, { backgroundColor: WHITE });
	    IO.append_element("div", ID_CENTER,
			      { width: CENTER_WIDTH, height: CENTER_HEIGHT,
				textAlign: "center", fontSize: CENTER_FONTSIZE},
			      ID_MAIN, "center");
	};

	set_screen();
	IO.setTimeout(do_trial, T_ITI);
    };

    // ***** 1試行の実施
    // next_trialを呼ぶこと
    var do_trial = function () {
	var setup = function () {
	    trial = block.trials[t];
	};

	setup();
	IO.present_stimuli_and_wait_for_key(
	    [["＋＋", T_FIX, ID_CENTER],
	     [trial.target, -1, ID_CENTER]],
	    [KEY_YES, KEY_NO],
	    set_reaction);
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶ
    var set_reaction = function (keycode, rt) {
	trial.rt = rt;
	if (trial.type === NONWORD) {
	    trial.result = ((keycode === KEY_NO) ? CORRECT : ERROR);
	} else {
	    trial.result = ((keycode === KEY_YES) ? CORRECT : ERROR);
	}
	IO.set_html((trial.result === CORRECT ? "○" : "×"), ID_CENTER);
	IO.setTimeout(next_trial, T_FEEDBACK);
    };

    // ***** 次の試行に進む処理
    // ブロックが終わりならblock_epilogue、そうでなければdo_trialを呼ぶ
    var next_trial = function () {
	var advance = function () {
	    t = t + 1;
	    if (t >= block.trials.length) {
		t = 0;
		b = b + 1;
		IO.setTimeout(block_epilogue, T_ITI);
	    } else {
		IO.setTimeout(do_trial, T_ITI);
	    }
	};

	IO.clear(ID_CENTER);
	return advance();
    };

    // ***** ブロック終了時に実施する処理
    // 実験が終わりならblock_prologue、そうでなければepilogueを呼ぶ
    // この関数が呼ばれた時点でbとtは既に進められているので注意
    // (blockとtrialは更新されていない)
    var block_epilogue = function () {
	var set_screen = function () {
	    IO.clear(ID_MAIN);
	    IO.set_element_style(ID_MAIN, {backgroundColor: CYAN, textAlign: "center"});
	};
	var advance = function () {
	    if (b < blocks.length) { block_prologue(); }
	    else { epilogue(); }
	};

	set_screen();
	return advance();
    };

    // ***** 全ブロック終了時に1回だけ実施する処理
    // データ保存など
    var epilogue = function () {
	var string = "";

	end_time = new Date();
	string = "# start: " + start_time + "\n# id: " + id + "\n# sex: " + sex + "\n";
	blocks.forEach(function (block) {
	    block.trials.forEach(function (trial) {
		string += [block.name, trial.type, trial.target, trial.result, trial.rt, "\n"].join()
	    });
	});
	IO.save_data(TITLE, id, string, ID_MAIN);
    };

    // ***** EXPオブジェクトの定義 通常は編集不要
    var that = {};
    that.init = function () {
	var load_images = function (i, s) {
	    id = i; sex = s;
	    if (typeof IMAGES !== 'undefined') { return IO.load_images(IMAGES, load_audios); }
	    else { return load_audios(); }
	};
	var load_audios = function (obj) {
	    if (typeof obj !== 'undefined') { IMAGES = obj; }
	    if (typeof AUDIOS !== 'undefined') { return IO.load_audios(AUDIOS, start); }
	    else { return start(); }
	};
	var start = function (obj) {
	    if (typeof obj !== 'undefined') { AUDIOS = obj; }
	    IO.clear(ID_MAIN);
	    start_time = new Date();
	    return prologue();
	};
	IO.append_element("div", ID_MAIN,
			  { width: MAIN_WIDTH, height: MAIN_HEIGHT,
			    padding: MAIN_PADDING, backgroundColor: CYAN },
			  null, "center");
	IO.input_basic_data(ID_MAIN, load_images);
    };
    return that;
}());
