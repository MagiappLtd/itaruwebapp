// lex_context
//
// 語彙決定課題2(文脈呈示条件あり)
// 2014年10月1日 認知心理学A(水野)の講義内で実施したものから
// 非単語を単語のパーツから再構成したものに変えた(作業中、まだ書き換えてない)

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "lex_context2014-2";	// 結果データを保存するディレクトリ名に使われる
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
	  ["汚染 環境 大気 公害", "政治 国会 経済 総理", "娯楽 遊び 趣味 旅行"]],
	 [SMALL,
	  ["深夜 ｺﾝﾋﾞﾆ 徘徊 番組", "財布 皮 お札 紛失", "季節 春 夏 変化"]],
	 [NONE,
	  ["未来 過去 予想 希望",	"電話 携帯 声 ﾍﾞﾙ",
	   "保存 冷蔵庫 冷凍 食料",	"預金 銀行 通帳 残高"]],
	 [NONWORD,
	  ["根客 黒字 倒産 借金",	"約駐 ｽｸﾘｰﾝ ﾎﾟｯﾌﾟｺｰﾝ 監督",
	   "濃宅 勉強 豊富 本",		"食続 電車 踏切 鉄道",
	   "損表 取得 免許 就職",	"想研 歴史 戦国 平成",
	   "辺増 実験 進歩 技術",	"吉泊 人間 会話 相手",
	   "差県 充電 単三 ｱﾙｶﾘ",	"直煙 ﾎﾟｽﾄ 郵便 文字"]]];

    var experiment_set = 
	[[LARGE, ["動揺 不安 心 緊張",		"刊行 雑誌 本 新聞",
		  "完了 任務 仕事 課題",	"講堂 大学 教会 学校",
		  "競技 ｽﾎﾟｰﾂ 陸上 運動",	"酸化 理科 鉄 還元",
		  "搭乗 飛行機 ﾊﾟｲﾛｯﾄ 船",	"繁栄 衰退 子孫 人類",
		  "意思 疎通 心 自分",		"養成 学校 子供 教育",
		  "制作 映画 発表 ﾄﾞﾗﾏ",	"教科 数学 国語 学校",
		  "操作 機械 ﾊﾟｿｺﾝ ｹﾞｰﾑ",	"過程 結果 実験 努力",
		  "包装 ﾌﾟﾚｾﾞﾝﾄ 紙 袋",		"正当 防衛 理由 意見",
		  "講義 授業 大学 単位",	"洗濯 服 家事 掃除",
		  "点字 盲目 障害者 ﾌﾞﾛｯｸ",	"帽子 頭 麦わら 夏"]],
	 [SMALL, ["鑑賞 映画 音楽 美術",	"検事 裁判 警察 弁護士",
		  "新年 正月 元旦 初詣",	"終身 保険 雇用 死",
		  "急死 事故 病気 葬式",	"待機 時間 準備 ﾍﾞﾝﾁ",
		  "期間 ﾃｽﾄ 限定 締切",		"解説 実況 回答 野球",
		  "街頭 ｱﾝｹｰﾄ 調査 演説",	"単価 お金 値段 円",
		  "起訴 裁判 犯罪 罪",		"厳格 父親 頑固 老人",
		  "潜在 能力 意識 力",		"改装 工事 店 新築",
		  "洗礼 宗教 ｷﾘｽﾄ教 儀式",	"用紙 ﾃｽﾄ 印刷 白",
		  "工学 理系 機械 電気",	"古典 国語 歴史 漢文",
		  "地震 津波 災害 東北",	"容量 ﾃﾞｰﾀ 携帯 ﾒﾓﾘｰ"]],
	 [NONE,  ["敗北 勝利 試合 屈辱",	"名簿 出席 ｸﾗｽ 生徒",
		  "漂流 無人島 海 川",		"議論 国会 会社 白熱",
		  "遠慮 謙虚 お菓子 我慢",	"輸血 病院 手術 注射",
		  "余裕 慢心 時間 自信",	"録画 ﾋﾞﾃﾞｵ ﾃﾚﾋﾞ 番組",
		  "運命 人生 出会い 糸",	"家賃 金 滞納 ｱﾊﾟｰﾄ",
		  // "脚本 映画 ﾄﾞﾗﾏ 作家",	"道具 便利 かなづち ﾍﾟﾝﾁ",
		  "看病 風邪 介護 患者",	"道具 便利 かなづち ﾍﾟﾝﾁ",
		  "画面 ﾃﾚﾋﾞ ﾊﾟｿｺﾝ 液晶",	"運搬 ﾄﾗｯｸ 業者 荷物",
		  "勤務 仕事 会社 労働",	"道徳 心 小学校 倫理",
		  "鎖国 日本 江戸時代 ｵﾗﾝﾀﾞ",	"迫害 差別 いじめ ﾕﾀﾞﾔ人",
		  "活字 本 小説 印刷",		"配属 部署 会社 仕事"]],
	 [NONWORD, ["長閣 人間 善人 呵責",	"世災 先生 怪我 白衣",
		    "現明 人気 ｱﾆﾒ 映画",	"種線 八百屋 街 本",
		    "額衆 完璧 機械 的",	"毒結 政治 社会 反対",
		    "境座 ｹﾞｰﾑ 剣 死",		"射税 会社 試合 陸上",
		    "樹益 赤 果物 青森",	"回留 車 ｼﾝｶﾞﾘ ﾏﾗｿﾝ",
		    "縮若 思考 数学 筋道",	"裁見 戦争 歴史 反乱",
		    "神縦 思想 本 理論",	"敬島 夏 種 海",
		    "秋筆 欲望 目標 闘争心",	"脱候 ﾛﾎﾞｯﾄ 操縦 制御",
		    "産逃 司会 後退 方向",	"質勝 ｱｳﾄ ﾊﾞｯﾄ ﾎﾞｰﾙ",
		    "知越 中国 古典 国語",	"聴路 有利 攻撃 守備",
		    "計通 新聞 配達 ｺｰﾋｰ",	"田素 時代 昭和 平成",
		    "艦美 暗闇 暗黒 火山",	"的廃 目 検査 色彩",
		    "後然 道路 車 光",		"陳源 先生 塾 大学",
		    "重番 小学校 道 通学",	"題雄 観察 状況 監視",
		    "橋鳥 北海道 冬 量",	"諸部 ﾗﾝﾅｰ 先行 比較",
		    "参実 ﾃｽﾄ ｶﾗｵｹ 先生",	"管露 亀 魚 鶏",
		    "感宿 正月 元旦 初詣",	"住望 基準 審査 発表",
		    "特窓 現実 脳 夢",		"民喜 飛行機 船 ﾊﾞｽ",
		    "尊次 笑顔 顔 頬",		"審著 針 病院 医者",
		    "適延 野球 打者 球",	"将取 天使 黒 地獄",
		    "丸欲 家族 絆 子供",	"調多 芸術 美術館 ｺﾞｯﾎ",
		    "問万 管理人 会社 責任",	"今立 脳 思い出 過去",
		    "得外 がけ 事故 安全",	"連希 日本 和服 ゆかた",
		    "買氏 酸素 透明 汚染",	"不星 犬 公園 道",
		    "陸決 ごみ 石油 ﾘｻｲｸﾙ",	"性目 過剰 喪失 勇気",
		    "普主 森 木 緑",		"京攻 指 警察 事件",
		    "小故 女神 ｱﾒﾘｶ 権利",	"免山 ｷﾞﾘｼｬ 神 伝説",
		    "九情 地球 平和 国",	"釈卒 高騰 ｱﾗﾌﾞ ｶﾞｿﾘﾝ",
		    "有下 木 天然 材料",	"破伴 結婚 円満 愛",
		    "混代 にんじん 健康 緑",	"邦階 調査 政治 世間"]]];

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
				   (SHOW_CONTEXT ?
                                    ["呈示場所を示す＋マークが２つ呈示された後，その場所にまず３つの単語が呈示され，その後，真ん中に１つの単語が呈示されます。その１つの単語が実在する単語の場合は右手の人差し指で【J】のキーを，実在しない非単語の場合は左手の人差し指で【F】のキーを，できるだけ早く正確に押してください。キーを押すと正解なら○，不正解なら×が表示され，しばらくすると，次の試行が呈示されます。なお，最初の３つの単語は必ずよく読んでください。そして，その後に１つだけ呈示される単語にだけ反応するよう，注意してください。"] :
                                    ["呈示場所を示す＋マークが２つ呈示された後，その場所に１つの単語が呈示されます。その単語が実在する単語の場合は右手の人差し指で【J】のキーを，実在しない非単語の場合は左手の人差し指で【F】のキーを，できるだけ早く正確に押してください。キーを押すと正解なら○，不正解なら×が表示され，しばらくすると，次の試行が呈示されます。"]),
                                   ID_MAIN);
	};

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
	    (SHOW_CONTEXT ?
		[["＋＋", T_FIX, ID_CENTER],
		 [trial.context, T_CONTEXT, ID_CENTER],
		 [trial.target, -1, ID_CENTER]] :
	        [["＋＋", T_FIX, ID_CENTER],
		 [trial.target, -1, ID_CENTER]]
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
