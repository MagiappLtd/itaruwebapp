// lex_context_audio_2
//
// 語彙決定課題2(音韻呈示・文脈呈示条件あり)
// 2014年10月8日 認知心理学A(松井)の授業内で実施したものから
// 非単語を単語のパーツから再構成したもの(lex_hiragana_audioと同じ)に変えた
// 2014年12月17日 認知心理学A(水野)の授業内で実施

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "lex_context_audio_2";	// 結果データを保存するディレクトリ名に使われる
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
    var AUDIOS = (function () {
	var array = [];
	var src = [ ["pw", 10],  // 練習用
		    ["pn", 10],  // 練習用非単語
		    ["ld", 20],  // 本実験用 差大
		    ["sd", 20],  // 本実験用 差小
		    ["no", 20],  // 本実験用 同音異義語なし
		    ["nw", 60],  // 本実験用非単語
		  ];
	src.forEach(function(pair) {
	    for (var i = 1; i <= pair[1]; i++) {
		var tmp = "0" + String(i);
		array.push("audio/" + pair[0] + tmp.substr(tmp.length - 2));
	    }
	});
	array.push("audio/check");
	return array;
    })();

    // ***** ブロック・試行・刺激の定義

    var make_trials = function(set) {
	var trials = [];
	set.forEach(function(subset) {
	    var type = subset[0];
	    subset[1].forEach(function(string) {
		var context = string.split(" ");
		var target = context.shift();
		trials.push({ type: type,
			      target: target,
			      context: context.join("　"),
			      result: undefined,
			      rt: undefined
			    });
	    });
	});
	return trials;
    };

    var practice_set = 
	[[LARGE,
	  ["pw01 環境 大気 公害", "pw02 国会 経済 総理", "pw03 遊び 趣味 旅行"]],
	 [SMALL,
	  ["pw04 ｺﾝﾋﾞﾆ 徘徊 番組", "pw05 皮 お札 紛失", "pw06 春 夏 変化"]],
	 [NONE,
	  ["pw07 過去 予想 希望",	"pw08 携帯 声 ﾍﾞﾙ",
	   "pw09 冷蔵庫 冷凍 食料",	"pw10 銀行 通帳 残高"]],
	 [NONWORD,
	  ["pn01 黒字 倒産 借金",	"pn02 ｽｸﾘｰﾝ ﾎﾟｯﾌﾟｺｰﾝ 監督",
	   "pn03 勉強 豊富 本",	"pn04 電車 踏切 鉄道",
	   "pn05 取得 免許 就職",	"pn06 歴史 戦国 平成",
	   "pn07 実験 進歩 技術",	"pn08 人間 会話 相手",
	   "pn09 充電 単三 ｱﾙｶﾘ",	"pn10 ﾎﾟｽﾄ 郵便 文字"]]];

    var experiment_set = 
	[[LARGE, ["ld01 不安 心 緊張",		"ld02 雑誌 本 新聞",
		  "ld03 任務 仕事 課題",	"ld04 大学 教会 学校",
		  "ld05 ｽﾎﾟｰﾂ 陸上 運動",	"ld06 理科 鉄 還元",
		  "ld07 飛行機 ﾊﾟｲﾛｯﾄ 船",	"ld08 衰退 子孫 人類",
		  "ld09 疎通 心 自分",		"ld10 学校 子供 教育",
		  "ld11 映画 発表 ﾄﾞﾗﾏ",	"ld12 数学 国語 学校",
		  "ld13 機械 ﾊﾟｿｺﾝ ｹﾞｰﾑ",	"ld14 結果 実験 努力",
		  "ld15 ﾌﾟﾚｾﾞﾝﾄ 紙 袋",		"ld16 防衛 理由 意見",
		  "ld17 授業 大学 単位",	"ld18 服 家事 掃除",
		  "ld19 盲目 障害者 ﾌﾞﾛｯｸ",	"ld20 頭 麦わら 夏"]],
	 [SMALL, ["sd01 映画 音楽 美術",	"sd02 裁判 警察 弁護士",
		  "sd03 正月 元旦 初詣",	"sd04 保険 雇用 死",
		  "sd05 事故 病気 葬式",	"sd06 時間 準備 ﾍﾞﾝﾁ",
		  "sd07 ﾃｽﾄ 限定 締切",		"sd08 実況 回答 野球",
		  "sd09 ｱﾝｹｰﾄ 調査 演説",	"sd10 お金 値段 円",
		  "sd11 裁判 犯罪 罪",		"sd12 父親 頑固 老人",
		  "sd13 能力 意識 力",		"sd14 工事 店 新築",
		  "sd15 宗教 ｷﾘｽﾄ教 儀式",	"sd16 ﾃｽﾄ 印刷 白",
		  "sd17 理系 機械 電気",	"sd18 国語 歴史 漢文",
		  "sd19 津波 災害 東北",	"sd20 ﾃﾞｰﾀ 携帯 ﾒﾓﾘｰ"]],
	 [NONE,  ["no01 勝利 試合 屈辱",	"no02 出席 ｸﾗｽ 生徒",
		  "no03 無人島 海 川",		"no04 国会 会社 白熱",
		  "no05 謙虚 お菓子 我慢",	"no06 病院 手術 注射",
		  "no07 慢心 時間 自信",	"no08 ﾋﾞﾃﾞｵ ﾃﾚﾋﾞ 番組",
		  "no09 人生 出会い 糸",	"no10 金 滞納 ｱﾊﾟｰﾄ",
		  // "脚本 映画 ﾄﾞﾗﾏ 作家",	"道具 便利 かなづち ﾍﾟﾝﾁ",
		  "no11 風邪 介護 患者",	"no12 便利 かなづち ﾍﾟﾝﾁ",
		  "no13 ﾃﾚﾋﾞ ﾊﾟｿｺﾝ 液晶",	"no14 ﾄﾗｯｸ 業者 荷物",
		  "no15 仕事 会社 労働",	"no16 心 小学校 倫理",
		  "no17 日本 江戸時代 ｵﾗﾝﾀﾞ",	"no18 差別 いじめ ﾕﾀﾞﾔ人",
		  "no19 本 小説 印刷",		"no20 部署 会社 仕事"]],
	 [NONWORD, ["nw01 人間 善人 呵責",	"nw02 先生 怪我 白衣",
		    "nw03 人気 ｱﾆﾒ 映画",	"nw04 八百屋 街 本",
		    "nw05 完璧 機械 的",	"nw06 政治 社会 反対",
		    "nw07 ｹﾞｰﾑ 剣 死",		"nw08 会社 試合 陸上",
		    "nw09 赤 果物 青森",	"nw10 車 ｼﾝｶﾞﾘ ﾏﾗｿﾝ",
		    "nw11 思考 数学 筋道",	"nw12 戦争 歴史 反乱",
		    "nw13 思想 本 理論",	"nw14 夏 種 海",
		    "nw15 欲望 目標 闘争心",	"nw16 ﾛﾎﾞｯﾄ 操縦 制御",
		    "nw17 司会 後退 方向",	"nw18 ｱｳﾄ ﾊﾞｯﾄ ﾎﾞｰﾙ",
		    "nw19 中国 古典 国語",	"nw20 有利 攻撃 守備",
		    "nw21 新聞 配達 ｺｰﾋｰ",	"nw22 時代 昭和 平成",
		    "nw23 暗闇 暗黒 火山",	"nw24 目 検査 色彩",
		    "nw25 道路 車 光",		"nw26 先生 塾 大学",
		    "nw27 小学校 道 通学",	"nw28 観察 状況 監視",
		    "nw29 北海道 冬 量",	"nw30 ﾗﾝﾅｰ 先行 比較",
		    "nw31 ﾃｽﾄ ｶﾗｵｹ 先生",	"nw32 亀 魚 鶏",
		    "nw33 正月 元旦 初詣",	"nw34 基準 審査 発表",
		    "nw35 現実 脳 夢",		"nw36 飛行機 船 ﾊﾞｽ",
		    "nw37 笑顔 顔 頬",		"nw38 針 病院 医者",
		    "nw39 野球 打者 球",	"nw40 天使 黒 地獄",
		    "nw41 家族 絆 子供",	"nw42 芸術 美術館 ｺﾞｯﾎ",
		    "nw43 管理人 会社 責任",	"nw44 脳 思い出 過去",
		    "nw45 がけ 事故 安全",	"nw46 日本 和服 ゆかた",
		    "nw47 酸素 透明 汚染",	"nw48 犬 公園 道",
		    "nw49 ごみ 石油 ﾘｻｲｸﾙ",	"nw50 過剰 喪失 勇気",
		    "nw51 森 木 緑",		"nw52 指 警察 事件",
		    "nw53 女神 ｱﾒﾘｶ 権利",	"nw54 ｷﾞﾘｼｬ 神 伝説",
		    "nw55 地球 平和 国",	"nw56 高騰 ｱﾗﾌﾞ ｶﾞｿﾘﾝ",
		    "nw57 木 天然 材料",	"nw58 結婚 円満 愛",
		    "nw59 にんじん 健康 緑",	"nw60 調査 政治 世間"]]];

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
	    IO.display_instruction("",
				   "実験の前にヘッドフォンの音量を調整します。下にある「テスト」というリンクをクリックすると音声が流れますので、なるべく大きめで聴きやすい音量に調整してください。音声は何度でも再生できます。音量の調整方法がわからないときは手をあげて実験者に聞いてください。調整が終わったら指示があるまでそのまま待っていてください。",
				   ID_MAIN);
	    IO.append_element("div", "button", "", ID_MAIN);
	    IO.set_html("<br><br><center><a href=\"JavaScript:EXP.adjust_volume();\">テスト</a></center>", "button");
	}

	var number = /\d+/.exec(id);
	if (number === null) {
	    SHOW_CONTEXT = (Math.random() < 0.5) ? true : false
	} else if (number % 2 === 0) {
	    SHOW_CONTEXT = true
	} else {
	    SHOW_CONTEXT = false
	}
	setup();
	set_screen();
	IO.wait_for_key(IO.KEYCODE.SPACE, prologue2);
    };
    var prologue2 = function () {
	IO.clear(ID_MAIN);
        IO.display_instruction("【語彙判断実験】",
			       (SHOW_CONTEXT ?
                                ["呈示場所を示す＋マークが２つ呈示された後，その場所にまず３つの単語が呈示され，その後，１つの単語がヘッドフォンから音声で呈示されます。その１つの単語が実在する単語の場合は右手の人差し指で【J】のキーを，実在しない非単語の場合は左手の人差し指で【F】のキーを，できるだけ早く正確に押してください。キーを押すと正解なら○，不正解なら×が表示され，しばらくすると，次の試行が呈示されます。なお，最初の３つの単語は必ずよく読んでください。そして，その後に音声で呈示される単語にだけ反応するよう，注意してください。"] :
                                ["呈示場所を示す＋マークが２つ呈示された後，１つの単語がヘッドフォンから音声で呈示されます。その単語が実在する単語の場合は右手の人差し指で【J】のキーを，実在しない非単語の場合は左手の人差し指で【F】のキーを，できるだけ早く正確に押してください。キーを押すと正解なら○，不正解なら×が表示され，しばらくすると，次の試行が呈示されます。"]),
                               ID_MAIN);
	block_prologue();
    }

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
	    (SHOW_CONTEXT ?
		[["＋＋", T_FIX, ID_CENTER],
		 [trial.context, T_CONTEXT, ID_CENTER],
		 ["", 0, ID_CENTER],
		 [AUDIOS["audio/" + trial.target], -1]] :
	        [["＋＋", T_FIX, ID_CENTER],
		 [AUDIOS["audio/" + trial.target], -1]]
	     ),
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
	string += "# context: " + SHOW_CONTEXT + "\n";
	blocks.forEach(function (block) {
	    block.trials.forEach(function (trial) {
		string += [block.name, trial.type, trial.target, trial.result, trial.rt, "\n"].join()
	    });
	});
	IO.save_data(TITLE, id, string, ID_MAIN);
    };

    // ***** EXPオブジェクトの定義 通常は編集不要
    var that = {};
    that.adjust_volume = function () {
	AUDIOS['audio/check'].play();
    };
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
