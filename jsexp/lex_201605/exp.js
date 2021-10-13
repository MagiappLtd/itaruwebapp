// lex_201605
//
// 語彙決定課題(音韻呈示)
//
// 2016年4月に水野さんが実施した実験(音韻によるプライム語呈示，プライ
// ムとターゲットの間に形態も音韻も共通な文字がある場合・音韻のみ共通
// な文字がある場合・ない場合を比較した実験)を変更したもの。
//
// 4月の実験ではターゲットが条件によって異なっていたが，今回はターゲッ
// トを同じにしてプライム語を変えて3条件を作成してある。当然ながら参加
// 者内実験は不可能なので参加者間にし，集団実験で大人数取ることになる。
// 

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "lex_201605";	// 結果データを保存するディレクトリ名に使われる
    var id, sex;	// 参加者情報
    var b = 0;		// 実行中のblock番号(0からblocks.length-1まで)
    var block;		// 実行中のblock
    var t = 0;		// 実行中のtrial番号(0からblock.trials.length-1まで)
    var trial;		// 実行中のtrial
    var start_time;
    var end_time;

    // ***** 実験固有の変数・定数
    var T_AUDIO = 1500;		// 音声プライム呈示から注視点までのISI(ms)
    var T_FIX = 200;		// 注視点呈示時間(ms)
    var T_ITI = 1000;		// 試行間間隔(ms)
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
    var WORD = "word";
    var NONWORD = "nonword";
    var VISUAL = "形音";
    var AUDIO = "音";
    var NON = "なし";
    var NA = [NON, AUDIO];
    var VN = [VISUAL, NON];
    var AV = [AUDIO, VISUAL];
    var STUDENT_ID = undefined;
    var CONDITION = undefined;	// NA VN AV のいずれか
		    // 被験者番号に応じてprologueで決定

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = (function () {
	var array = [];
	var src = [ ["prp", 9],  // 練習用
		    ["prpn", 9], // 練習用非単語
		    ["p", 60],   // 本実験前半用
		    ["pn", 20],  // 本実験前半用非単語
		    ["2p", 96],   // 本実験後半用
		    ["2pn", 32],  // 本実験後半用非単語
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
	    subset[1].forEach(function(array) {
		if (array.length > 3) {
		    trials.push({ type: type,
				  prime: array.slice(0,-1),
				  target: array[3],
				  result: undefined,
				  rt: undefined
				});
		} else {
		    trials.push({ type: type,
				  prime: [array[0]],
				  target: array[1],
				  result: undefined,
				  rt: undefined
				});
		}
	    });
	});
	return trials;
    };

    var practice_set =
	[[WORD,
	  [["prp01", "余裕"], ["prp02", "強制"], ["prp03", "店舗"], ["prp04", "消化"], ["prp05", "処分"],
	   ["prp06", "貧民"], ["prp07", "犠牲"], ["prp08", "未来"], ["prp09", "細胞"]]],
	 [NONWORD,
	  [["prpn01", "宇資"], ["prpn02", "機仲"], ["prpn03", "演覚"], ["prpn04", "診属"], ["prpn05", "偽牧"],
	   ["prpn06", "術礎"], ["prpn07", "苦証"], ["prpn08", "引専"], ["prpn09", "妻治"]]]];

    var experiment_set1 = (function () {
	var a_w = [];
	var a_n = [];
	var word = "経歴 押印 打者 病欠 賃金 温度 応募 事務 招集 認定 例文 対決 対応 結晶 保育 解説 推論 選考 帝王 職業";
	var nonw = "長閣 世災 量明 述線 額衆 毒容 境座 射税 全輝 政責 縮若 離見 神縦 敬島 秋筆 落省 産逃 紀勝 気越 無屋";
	var n = 1;
	var normalize = function(n) {
	    if (n > 9) {
		return String(n);
	    } else {
		return "0" + String(n);
	    }
	};
	word.split(" ").forEach(function(string) {
	    a_w.push(["p" + normalize(n), "p" + normalize(n + 20), "p" + normalize(n + 40), string])
	    n++;
	});
	n = 1;
	nonw.split(" ").forEach(function(string) {
	    a_n.push(["pn" + normalize(n), string]);
	    n++;
	});
	return [[WORD, a_w], [NONWORD, a_n]];
    })();

    var experiment_set2 = (function () {
	var a_w = [];
	var a_n = [];
	var word = "安定 開幕 教訓 激励 結集 原料 国連 困難 作戦 失敗 重油 手段 人格 水爆 大卒 体罰 弾薬 注目 定員 適応 伝票 道路 特許 任命 配慮 番号 評判 満足 名簿 面倒 木材 役目";
	var nonw = "粉通 田素 艦美 的廃 後然 陳韻 徳領 綿風 題観 橋鳥 石諸 参実 丸露 感宿 造快 最窓 察代 尊次 山語 合農 初方 庫欲 追多 野言 今立 得絶 陣念 買氏 録精 史庭 営起 戒動";
	var n = 1;
	var normalize = function(n) {
	    if (n > 9) {
		return String(n);
	    } else {
		return "0" + String(n);
	    }
	};
	word.split(" ").forEach(function(string) {
	    a_w.push(["2p" + normalize(n), "2p" + normalize(n + 32), "2p" + normalize(n + 64), string])
	    n++;
	});
	n = 1;
	nonw.split(" ").forEach(function(string) {
	    a_n.push(["2pn" + normalize(n), string]);
	    n++;
	});
	return [[WORD, a_w], [NONWORD, a_n]];
    })();

    var blocks = [
	{ name: "練習",
	  type: PRACTICE,
	  trials: make_trials(practice_set) },
	{ name: "本試行の前半",
	  type: EXPERIMENT,
	  trials: make_trials(experiment_set1) },
	{ name: "本試行の後半",
	  type: EXPERIMENT,
	  trials: make_trials(experiment_set2) }
	];

    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
	IO.input_other_data(ID_MAIN, prologue2, "学籍番号を半角英数文字で入力してください。");
    }
    var prologue2 = function (student_id) {
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

	id = id.toHankaku();
	var number = /\d+/.exec(id);
	if (number === null) {
	    number = Math.floor(Math.random() * 3)
	}
	CONDITION = [NA, VN, AV][number % 3]
	STUDENT_ID = student_id.toHankaku().toLowerCase();

	setup();
	set_screen();
	IO.wait_for_key(IO.KEYCODE.SPACE, prologue3);
    };
    var prologue3 = function () {
	IO.clear(ID_MAIN);
        IO.display_instruction("【語彙判断実験】",
                               ["実験が始まると最初に１つの単語がヘッドフォンから音声で呈示されます。その単語がどんな単語かよく聴いてください。その後，呈示場所を示す*マークが2つ表示されたあと，その場所に刺激が呈示されます。やっていただくことは，その刺激が意味のある単語の場合は右手の人差し指で【J】, 実在しない非単語の場合は左手の人差し指で【F】のキーを押していただくことです。非単語か単語かを，できるだけ間違えないようにして，わかったらすぐキーを押すようにしてください。",
			        "本試行は2つのブロックから成り，1ブロック目は40試行，2ブロック目は64試行です。",
				"本試行の前に18試行の練習を行いますので，手順に慣れてください。"],
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
	var prime;

	setup();
	prime = trial.prime[0];
	if (trial.prime.length > 1) {
	    switch(CONDITION[b - 1]) {
	    case AUDIO:
		prime = trial.prime[1]; break;
	    case NON:
		prime = trial.prime[2]; break;
	    }
	}
	IO.present_stimuli_and_wait_for_key(
	    [[AUDIOS["audio/" + prime], T_AUDIO],
	     ["＊＊", T_FIX, ID_CENTER],
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
	string = "# start: " + start_time + "\n# end  : " + end_time + "\n# id: " + id + "\n# sex: " + sex + "\n";
	string += "# student id: " + STUDENT_ID + "\n";
	string += "# condition: " + CONDITION[0] + "-" + CONDITION[1] + "\n";
	blocks.forEach(function (block, b) {
	    block.trials.forEach(function (trial) {
		var prime = trial.prime[0];
		if (trial.prime.length > 1) {
		    switch(CONDITION[b - 1]) {
		    case AUDIO:
			prime = trial.prime[1]; break;
		    case NON:
			prime = trial.prime[2]; break;
		    }
		}
		prime = prime.replace(/^2/, "");
		var block_condition = (b === 0 ? '' : (b === 1 ? CONDITION[0] : CONDITION[1]))
		string += [block.name, block_condition, prime, trial.type, trial.target, trial.result, trial.rt, "\n"].join()
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
