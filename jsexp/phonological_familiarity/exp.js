// phonetic familiarity
//
// 単語を音声呈示し、音韻的親密度を7段階評定する
// 14-12-17 認知A(水野クラス)で実施(データはphonetic_familiarity)
// 14-12-24 以下の単語を追加して認知A(松井クラス)で実施(データはphonetic_familiarity2)
// bouchou chosyo dakyou gidai haisen iron
// keireki ninmu riritu saitaku seiki yakunin

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "phonetic_familiarity2";       // 結果データを保存するディレクトリ名に使われる
    var id, sex;        // 参加者情報
    var b = 0;          // 実行中のblock番号(0からblocks.length-1まで)
    var block;          // 実行中のblock
    var t = 0;          // 実行中のtrial番号(0からblock.trials.length-1まで)
    var trial;          // 実行中のtrial
    var start_time;
    var end_time;

    // ***** 実験固有の変数・定数
    var T_FIX = 200;            // 注視点呈示時間(ms)
    var T_BLANK = 200;          // 注視点から刺激までのISI(ms)
    var T_ITI = 1000;           // 試行間間隔(ms)
    var TIMEOUT = 500;          // 制限時間(ms)
    var NO_TIMEOUT = -1;        // 制限時間なしを表す値
    var ID_MAIN = "main";       // 表示領域のID
    var MAIN_WIDTH = "800px";   // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";       // 表示領域の背景色
    var WHITE = "#FFFFFF";      // 表示領域の背景色
    var MAX_POINT = 7;		// 評定尺度数

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    // 練習
    var practice_set = "souko syumi setuyaku nouha ooame".split(" ");
    // 実験3(lex_new_heterograph454,lex_hiragana,lex_hiragana_audio)で使用した単語
    var experiment1_set = "douyou kitai shinkou kanryou koudou kyougi sanka toujou hannei ishi yousei seisaku kyouka sousa katei choukan housou kaitei seito shikaku kansyou kenji kakushin kyouyou sentou syushin kyuushi taiki kikan kaisetu gaito tanka kiso toukou genkaku doukou senzai zensya kinkou senrei haiboku ronri hyouryuu giron kakumei enryo yuketu rokuga unmei yachin kanbyou gamen unpan kinmu doutoku sakoku dougu hakugai katuji yashin".split(" ");
    // 実験4(lex_freqsum_balance)で使用した単語から実験3との重複を除いたもの
    var experiment2_set = "bakuha boutou chakuriku chotiku dentou eigyo ekisyou gaisyutu gassyuku genkyuu gimu haisen hatuden himitu iin jouin kaigun kaiki kaitei kakou kessyo koucho kougaku kougi koui koukei koukyu koushi koushin kousoku kyuuen menkyo moyou nouson okujou ryoushi sakkyoku sansei sekitan shiki shikou shinkoku souzou syoki syudou syujutu syutugen taiiku teika tousou tousyu yakuhin yokujitu youryou youshi yoyaku yuukou bouchou chosyo dakyou gidai haisen iron keireki ninmu riritu saitaku seiki yakunin".split(" ");

    var AUDIOS = (function () {
	var array = [];
	var src = practice_set.concat(experiment1_set).concat(experiment2_set).concat(["check"]);
	src.forEach(function (word) {
	    array.push("audio/" + word);
	});
	return array;
    })();

    // ***** ブロック・試行・刺激の定義
    var make_trials = function (set) {
	var trials = []
	set.forEach(function (name) {
	    trials.push({ name: name, result: undefined });
	});
	return trials;
    };

    var blocks = [
        { name: "練習",
          trials: make_trials(practice_set) },
	{ name: "本試行1",
	  trials: make_trials(experiment1_set) },
	{ name: "本試行2",
	  trials: make_trials(experiment2_set) },
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
				   ["実験の前にヘッドフォンの音量を調整します。下にある「テスト」というリンクをクリックすると音声が流れますので、なるべく大きめで聴きやすい音量に調整してください。音声は何度でも再生できます。音量の調整方法がわからないときは手をあげて実験者に聞いてください。",
				    "調整が終わったら指示があるまでそのまま待っていてください。"],
				   ID_MAIN);
	    IO.append_element("div", "button", "", ID_MAIN);
	    IO.set_html("<br><br><center><a href=\"JavaScript:EXP.adjust_volume();\">テスト</a></center>", "button");
        };

        setup();
        set_screen();
	IO.wait_for_key(IO.KEYCODE.SPACE, prologue2);
    };

    var prologue2 = function () {
	IO.clear(ID_MAIN);
        IO.display_instruction("",
                               ["試行が始まると単語が1つ音声で呈示されます。その単語を言葉としてどの程度聞いたことがあるか(なじみがあるか)を判断して、1:全く聞いたことがない〜7:非常によく聞いたことがある、の7段階で評定してください。そして、該当する番号の位置のボタンをクリックしてチェックしてください。",
				"1: 全く聞いたことがない 2: ほとんど聞いたことがない 3: あまり聞いたことがない 4: 普通 5: やや聞いたことがある 6: かなりよく聞いたことがある 7: 非常によく聞いたことがある",
				"\"決定\"ボタンをクリックすると次の試行に進みます。なお、単語をもう一度聴きたい場合は\"再生\"ボタンをクリックすれば何度でも再生できます。",
				"スペースキーを押すと実験が始まります。"], 
                               ID_MAIN);
        IO.wait_for_key(IO.KEYCODE.SPACE, block_prologue);
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
	IO.clear(ID_MAIN);
        IO.display_instruction("",
                               ["これから" + block.name + "を行ないます。全部で" + block.trials.length + "試行あります。",
				"スペースキーを押すと実験が始まります。"], 
                               ID_MAIN);
        IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
    };

    // ***** ブロック最初の試行に先立って実施する処理
    // 表示領域の準備など
    // do_trialを呼ぶこと
    var do_first_trial = function () {
        var set_screen = function () {
	    var str, i, element;
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, { backgroundColor: WHITE });
	    element = document.getElementById(ID_MAIN);
	    str = "<form name=\"_point_scale_form\"><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr><td></td>";
	    for (i = 1; i <= MAX_POINT; i++) {
		str += "<td align=\"center\">" + i + "</td>";
	    }
	    str += "<td></td></tr><tr><td>全く聞いたことがない</td>";
	    for (i = 1; i <= MAX_POINT; i++) {
		str += ("<td><img src=\"../IMAGE/scale/scale_" +
			((i === 1) ? "l" : ((i === MAX_POINT) ? "r" : "m")) +
			".png\"</td>");
	    }
	    str += "<td>非常によく聞いたことがある</td></tr><tr><td></td>";
	    for (i = 1; i <= MAX_POINT; i++) {
		str += "<td align=\"center\"><input type=\"radio\" name=\"point\" value=\"" + i + "\"></td>";
	    }
	    str += "<td></td></tr><tr><td></td><td colspan=\"" + MAX_POINT + "\" align=\"center\"><input type=\"button\" value=\"再生\" name=\"replay\">&nbsp;&nbsp;<input type=\"button\" value=\"決定\" name=\"done\"></td><td></td></tr></table></form>";
	    element.innerHTML = str;
        };

        set_screen();
        IO.setTimeout(do_trial, T_ITI);
    };

    var point_scale_receiver = function () {
	var result;
	result = document._point_scale_form.point.value;
	if (result === "") {
	    return false;
	} else {
	    return set_reaction(Number(result));
	}
    };

    var replay = function () {
	AUDIOS['audio/' + trial.name].play();
    };

    var null_function = function () {
	return false;
    };

    // ***** 1試行の実施
    // next_trialを呼ぶこと
    var do_trial = function () {
        var setup = function () {
            trial = block.trials[t];
        };

        setup();
	replay();
	document._point_scale_form.done.onclick = point_scale_receiver;
	document._point_scale_form.replay.onclick = replay;
    };

    // ***** 決定があったときに呼ばれる関数
    // next_trialを呼ぶ
    var set_reaction = function (result) {
        trial.result = result;
	document._point_scale_form.done.onclick = null_function;
	document._point_scale_form.replay.onclick = null_function;
	var count = document._point_scale_form.elements.length;
	for (var i = 0; i < count; i++) {
	    document._point_scale_form.elements[i].checked = false;
	}
	document._point_scale_form.point.value = "";
        return next_trial();
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
            var average = 0, timeout = 0;

            block.trials.forEach(function (trial) {
		string += [block.name, trial.name, trial.result, "\n"].join()
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
