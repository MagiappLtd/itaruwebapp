// lex_context
//
// 語彙決定課題(音声呈示)
// 単語は実験3(2014lex_new_heterograph454)と同じ
// 非単語は単語のパーツから再構成したものを使っている
// 2014年10月16・17日 水野さんが実施したひらがな呈示を音声呈示に変更
// 2014年10月22日 水野さん実施

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "lex_hiragana_audio";	// 結果データを保存するディレクトリ名に使われる
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
	[LARGE, "souko syumi setuyaku"],
	[SMALL, "nouha ooame kousou"],
	[NONE, "iin ryohi teien dentou"],
	[NONWORD,
	"chikyaku maryuu nouken syokuzoku sonhyou chokusei hense mohaku kyosa rakuou"]];

    var experiment_set = [
	[LARGE, "douyou kitai shinkou kanryou koudou kyougi sanka toujou hannei ishi yousei seisaku kyouka sousa katei choukan housou kaitei seito shikaku"],
	[SMALL, "kansyou kenji kakushin kyouyou sentou syushin kyuushi taiki kikan kaisetu gaito tanka kiso toukou genkaku doukou senzai zensya kinkou senrei"],
	[NONE, "haiboku ronri hyouryuu giron kakumei enryo yuketu rokuga unmei yachin kanbyou gamen unpan kinmu doutoku sakoku dougu hakugai katuji yashin"],
	[NONWORD, "shicho syayoku ikyuu chousyuku syousyuku kyouzei kanyoku genhitu keietu shinma sannyoku kaijutu saijuu youetu chiketu syuhatu syuugai syoetu gocho chuuri homei ryouhatu juugai konhatu daihai renso syaen sonkyuu ganzetu denta juhatu syukusen monhitu hakusyou gakubi chinen dokukaku baiza tokubi tuimei tekikou minjitu seban funhitu shitubi datuza kieki iritu choutuu syoutuu kyouzetu kanhai genhatu keiza shinzetu sanhitu kaini sairitu youcho chiza"]];

    var AUDIOS = (function () {
	var array = [];
	practice_set.forEach(function (block) {
	    block[1].split(" ").forEach(function (name) {
		array.push("audio/" + name);
	    });
	});
	experiment_set.forEach(function (block) {
	    block[1].split(" ").forEach(function (name) {
		array.push("audio/" + name);
	    });
	});
	array.push("audio/check");
	return array;
    }());

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

	setup();
	set_screen();
	IO.wait_for_key(IO.KEYCODE.SPACE, prologue2);
    };
    var prologue2 = function () {
	IO.clear(ID_MAIN);
        IO.display_instruction("【語彙判断実験】",
                               ["呈示場所を示す＋マークが２つ呈示された後，１つの単語がヘッドフォンから音声で呈示されます。その単語が実在する単語の場合は右手の人差し指で【J】のキーを，実在しない非単語の場合は左手の人差し指で【F】のキーを，できるだけ早く正確に押してください。キーを押すと正解なら○，不正解なら×が表示され，しばらくすると，次の試行が呈示されます。"],
                               ID_MAIN);
	block_prologue();
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
	     [AUDIOS["audio/" + trial.target], -1]],
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
