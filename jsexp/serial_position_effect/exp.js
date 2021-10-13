// serial_position_effect
//
// 系列位置効果

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "serial_position_effect";       // 結果データを保存するディレクトリ名に使われる
    var SAVE_STYLE = "summary";         // "verbose"だと詳細形式で保存
    var DELIMITER = "\t";               // 結果データのデリミタ
    var id, sex;        // 参加者情報
    var b = 0;          // 実行中のblock番号(0からblocks.length-1まで)
    var block;          // 実行中のblock
    var t = 0;          // 実行中のtrial番号(0からblock.trials.length-1まで)
    var trial;          // 実行中のtrial
    var start_time;
    var end_time;

    // ***** 実験固有の変数・定数
    var T_FIX = 500;            // 注視点呈示時間(ms)
    var T_BLANK = 500;  // 空白の呈示時間(ms)
    var T_WORD = 1000;  // 刺激呈示時間(ms)
    var T_ISI = 500;            // 刺激間間隔(ms)
    var T_DELAY = 30*1000;      // 妨害課題の時間
    var T_ITI = 500;            // 試行間間隔(ms)
    var ID_MAIN = "main";       // 表示領域のID
    var MAIN_WIDTH = "800px";   // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";       // 表示領域の背景色
    var WHITE = "#FFFFFF";      // 表示領域の背景色
    var ID_CENTER = "center";           // 刺激呈示領域のID
    var CENTER_WIDTH = "800px"; // 刺激呈示領域の幅
    var CENTER_HEIGHT = "80px"; // 刺激呈示領域の高さ
    var CENTER_FONTSIZE_LARGE = "48px"; // 刺激呈示領域のフォントサイズ
    var CENTER_FONTSIZE_SMALL = "16px"; // 刺激呈示領域のフォントサイズ
    var ID_FORM = "form";
    var FORM_WIDTH = "800px";
    var FORM_HEIGHT = "150px";
    var FORM_X = 40;
    var FORM_Y = 300;
    var ID_ANSWER = "answer";
    var ANSWER_WIDTH = "600px";
    var ANSWER_HEIGHT = "100px";
    var ID_BUTTON = "button";
    var CORRECT = "Correct";
    var ERROR = "Error";
    var PRACTICE = "practice";
    var EXPERIMENT = "experiment";
    var HEADMAX = 5;    // 何番目の単語までをリスト初頭部とするか
    var MIDDLEMAX = 10; // 何番目の単語までをリスト中央部とするか

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = null;
    var IMAGES = null;

    // ***** ブロック・試行・刺激の定義
    var make_trials = function (src) {
        var array = [], delay;
        var immediate, delayed;
        
        // 単語リストのうち半分は直後再生、半分は遅延再生(順序はランダム)
        immediate = Math.floor(src.length / 2);
        delayed = src.length - immediate;
        delay = [[0].repeat(immediate), [T_DELAY].repeat(delayed)].flatten1().shuffle();

        // ["なか なに ...", "くに まえ ...", ...]のようになっているsrcから
        // trialsを生成
        src.forEach(function (s, i) {
            array.push( {
                words: s.split(" "),
                delay: delay[i],
                sub_start: 100 + IO.make_random_number(-10, 10), // 妨害課題の開始数
                sub_count: 3, // 妨害課題の減算単位
                answer: null,
                result: null
            } );
        });
        return array;
    };

    var blocks = [
        { name: "練習", type: PRACTICE,
          trials: make_trials(["ひと さき みず わく なし",
                               "そば もと えき くみ はな"]) },
        { name: "本試行", type: EXPERIMENT,
          trials: make_trials(
           ["なか なに かれ はる へや むね つみ つち だし にし ぎん ゆか はい こい ふろ",
            "くに まえ との がん よる いが みみ かわ あじ まと ほし いぬ すじ はだ あか",
            "こえ みち だれ まち せき わけ あさ よこ なみ げき てら おう ふち すね すな",
            "とし いえ こめ えん たね いろ たび ねつ おき まど はか くつ とも はね よめ",
            "うち かく けん あし つぎ うた きた まご べつ かぎ むき はし ひざ のど すし",
            "もの みせ ちち かぶ くち はた しま あと ふゆ はこ うし あせ てつ かに ぬの",
            "いま ほん つま なつ むら あめ たこ ごみ かげ たま もん くも わざ やみ たけ",
            "ほか れい はは ゆめ みぎ さけ もり かた いと にく うま なべ うそ こや はり",
            "いか けが ゆび とき つき そと ゆき だい まつ うで てき あね しろ ねこ きし",
            "むち かお かみ おや うみ やま めど そら うら はら やね まく うに ふた みぞ"
           ]) }
    ];

    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
        b = 0;
        IO.clear(ID_MAIN);
        IO.display_instruction(
            "【系列位置効果】",
            [["画面中央にひらがな2文字の単語が1つずつ呈示されていきますので，なるべくたくさん憶えてください。呈示される単語数は，練習のときは5，実験では15です。呈示が終わると指示が表示されます。指示文には2種類あり，場合によってやることが違います。", "left"],
             ["1)「単語を入力し，終了をクリックしてください。」と表示された場合はそのまま単語入力に進みます(入力のしかたは後で説明します)", "left"],
             ["2)「〜から〜ずつ引いてください」のように表示された場合は，この表示が出ている間，指示に従って引き算をしながら数を思い浮かべてください。たとえば「86から3ずつ引いてください」なら83，80，77，74，...と順々に思い浮かべます。周囲のじゃまにならないよう声は出さないでほしいのですが，手抜きをせず，引き算を一つ一つ必ず実行してください。一定時間が過ぎると表示が「まず最後の数を，それから単語を入力し，終了をクリックしてください。」に変わります。そうしたら引き算をやめ，まず最後に思い浮かべた数を入力の枠の先頭に入力し，そのあと単語入力に進みます(入力のしかたは次で説明します)。", "left"],
             ["スペースキーを押すと入力のしかたの説明に移ります。", "center"]],
            ID_MAIN);
        IO.wait_for_key(IO.KEYCODE.SPACE, prologue2);
    };

    var prologue2 = function () {
        IO.clear(ID_MAIN);
        IO.display_instruction(
            "【系列位置効果】",
            [["単語入力では，さきほど呈示された単語を思い出して，入力枠の中に入力していってください。マウスで枠をクリックしなくても，なにもせずそのままキーボードを打てばその枠の中に日本語で入力されるようになっています。単語はひらがなだけで入力し，単語と単語の間は空白か改行で区切ってください。記入の順序は呈示された通りでなくてもかまいませんので，できるだけたくさん思い出してください。引き算を行なった場合は最後に思い浮かべた数を枠の先頭に入力するのを忘れないようにしてください(日本語モードになっていますので，全角でかまいません)。もうそれ以上思い出せなくなったらやめて次に進みます。思い出して記入する時間は5分程度までにしてください。記入が終わったら「終了」をクリックします。これで1試行が終了します。", "left"]],
            ID_MAIN);
        block_prologue();
    };

    // ***** ブロックごとの開始時に実施する処理
    // ブロックごとの教示・試行実施順の決定など
    // do_first_trialを呼ぶこと
    var block_prologue = function () {
        block = blocks[b];
        block.trials.shuffle();
        t = 0;
        IO.append_paragraph("スペースキーを押すと" + block.name + "を開始します。" +
                            "全部で" + block.trials.length + "試行あります。", 
                            ID_MAIN,
                            "center");
        IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
    };

    // ***** ブロック最初の試行に先立って実施する処理
    // 表示領域の準備など
    // do_trialを呼ぶこと
    var do_first_trial = function () {
        var set_screen = function () {
            var div;
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, { backgroundColor: WHITE });
            IO.append_element('div', ID_CENTER,
                              { width: CENTER_WIDTH, height: CENTER_HEIGHT,
                                textAlign: "center", fontSize: CENTER_FONTSIZE_LARGE},
                              ID_MAIN, "center");
            div = IO.append_element('div', null,
                                    { width: FORM_WIDTH, height: FORM_HEIGHT,
                                      textAlign: "center" },
                                    ID_MAIN, FORM_X, FORM_Y );
            IO.set_html("<form id='" + ID_FORM + "'><p>" +
                        "<textarea id='" + ID_ANSWER + "''></textarea><br>" +
                        "<input type='button' value='終了' id='" + ID_BUTTON + "'>" +
                        "</p></form>",
                        div);
            IO.set_element_style(ID_ANSWER, { imeMode: "active", width: ANSWER_WIDTH,
                                              height: ANSWER_HEIGHT });
            IO.set_element_style(ID_FORM, { display: "none", textAlign: "center" });
            document.getElementById(ID_FORM).onsubmit = function () { return false; };
            document.getElementById(ID_BUTTON).onclick = set_result;
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
        var stimuli;

        setup();
        stimuli = [["＊", T_FIX, ID_CENTER],
                   ["", T_BLANK, ID_CENTER]];
        trial.words.forEach(function (w, i) {
            stimuli.push([w, T_WORD, ID_CENTER]);
            if (i !== trial.words.length - 1) {
                stimuli.push(["", T_ISI, ID_CENTER]);
            }
        });
        IO.present_stimuli_and_wait_for_key(stimuli, [], do_trial2);
    };

    var do_trial2 = function () {
        var set_screen = function () {
            IO.set_element_style(ID_MAIN, { backgroundColor: CYAN });
            IO.clear(ID_CENTER);
            IO.set_element_style(ID_CENTER, { fontSize: CENTER_FONTSIZE_SMALL });
        };

        set_screen();
        if (trial.delay === 0) {
            IO.set_html("単語を入力し，終了をクリックしてください。", ID_CENTER);
            do_trial4();
        } else {
            IO.set_html("" + trial.sub_start + "から" + trial.sub_count +
                        "ずつ引いてください。", ID_CENTER);
            IO.setTimeout(do_trial3, trial.delay);
        }
    };

    var do_trial3 = function () {
        IO.clear(ID_CENTER);
        IO.set_html("まず最後の数を，それから単語を入力し，終了をクリックしてください。", ID_CENTER);
        do_trial4();
    };

    var do_trial4 = function () {
        document.getElementById(ID_FORM).style.display = "";
        document.getElementById(ID_ANSWER).focus();
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶこと
    var set_result = function () {
        document.getElementById(ID_FORM).style.display = "none";
        IO.clear(ID_CENTER);
        IO.set_element_style(ID_MAIN, { backgroundColor: WHITE });
        IO.set_element_style(ID_CENTER, { fontSize: CENTER_FONTSIZE_LARGE });
        if (DEBUG) {
            trial.answer = "";
            trial.words.forEach(function (w) {
                if (Math.random() > 0.5) {
                    if (trial.answer !== "")  {
                        trial.answer += " ";
                    }
                    trial.answer += w;
                }
            });
            setTimeout(next_trial, 0);
        } else {
            input = document.getElementById(ID_ANSWER);
            trial.answer = input.value;
            input.value = "";
            setTimeout(next_trial, 0);
        }
        return true;
    };

    // ***** 次の試行に進む処理
    // ブロックが終わりならblock_epilogue，そうでなければdo_trialを呼ぶこと
    var next_trial = function (keycode, rt) {
        var advance = function () {
            t = t + 1;
            if (t >= block.trials.length) {
                t = 0; b = b + 1; IO.setTimeout(block_epilogue, T_ITI);
            } else {
                IO.setTimeout(do_trial, T_ITI);
            }
        };

        trial.result = [];
        trial.answer = trial.answer.replace(/\n/, " ");
        trial.answer.split(" ").forEach(function (a) {
            var p = trial.words.indexOf(a);
            if (p >= 0) { trial.result.push(p); }
        });
        advance();
    };

    // ***** ブロック終了時に実施する処理
    // 実験が終わりならblock_prologue，そうでなければepilogueを呼ぶ
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
        advance();
    };

    // ***** 全ブロック終了時に1回だけ実施する処理
    // データ保存など
    var epilogue = function () {
        var string = "", trials = {};

        end_time = new Date();
        if (typeof SAVE_STYLE === 'undefined' || SAVE_STYLE !== 'verbose') {
            //                   試行1          試行2              ... 試行5
            //id      sex   条件 冒頭 中間 末尾 冒頭 中間 末尾 ...
            //hw00001 male  直後 ...
            //hw00001 male  遅延 ...

            // 条件ごとに試行をまとめなおす
            // trials[条件][試行番号]
            //   条件は0かT_DELAY、試行番号は0,1,..
            blocks.forEach(function (block) {
                if (block.type === PRACTICE) { return; };
                block.trials.forEach(function (trial) {
                    trials.init_property(trial.delay, []);
                    trials[trial.delay].push(trial);
                });
            });

            // 初頭部・中間部・末尾部ごとに正答数を計算して出力
            // trial.resultは [ 14, 0, 3 ... ] のような正再生された系列位置の配列
            [0, T_DELAY].forEach(function (delay) {
                string += [id, sex, delay/1000].join(DELIMITER);
                trials[delay].forEach(function (trial) {
                    var head = 0, middle = 0, tail = 0;
                    trial.result.forEach(function (v) {
                        if (v < HEADMAX) {
                            head += 1;
                        } else if (v < MIDDLEMAX) {
                            middle += 1;
                        } else {
                            tail += 1;
                        }
                    });
                    string += DELIMITER + [head, middle, tail].join(DELIMITER);
                });
                string += "\n";
            });
            IO.save_data(TITLE, "", string, ID_MAIN, "append");
        } else {
            string += "### " + TITLE + "\n";
            string += "### id = " + id + " sex = " + sex + "\n";
            string += "### start: " + start_time + "\n";
            blocks.forEach(function (block) {
                block.trials.forEach (function(trial) {
                    string += [block.name, trial.words.length,
                               trial.words.join(" "),
                               trial.delay, trial.answer,
                               trial.result.join(" ")].join(DELIMITER) + "\n";
                });
            });
            string += "### end  : " + end_time + "\n";
            IO.save_data(TITLE, id, string, ID_MAIN);
        }
    };

    // ***** EXPオブジェクトの定義 通常は編集不要
    var that = {};
    that.init = function () {
        var load_images = function (i, s) {
            id = i; sex = s;
            if (typeof IMAGES !== 'undefined') { IO.load_images(IMAGES, load_audios); }
            else { return load_audios(); }
        };
        var load_audios = function (obj) {
            if (typeof obj !== 'undefined') { IMAGES = obj; }
            if (typeof AUDIOS !== 'undefined') { IO.load_audios(AUDIOS, start); }
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
