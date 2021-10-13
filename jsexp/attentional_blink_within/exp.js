// Attentional Blink within
//
// 注意の瞬き(参加者内)

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "attentional_blink_within";     // 結果データを保存するディレクトリ名に使われる
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
    var T_FIX = 300;                    // 注視点呈示時間(ms)
    var T_BLANK = 500;          // 注視点から第1刺激まで(ms)
    var T_SOA = 100;                    // SOA
    var T_ITI = 1000;                   // 試行間間隔(ms)
    var ID_MAIN = "main";               // 表示領域のID
    var MAIN_WIDTH = "800px";           // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";               // 領域の背景色
    var WHITE = "#FFFFFF";              // 領域の背景色
    var ID_IMAGE = "image";             // 刺激画像のID
    var IMAGE_WIDTH = "80px";   // 刺激画像の幅
    var IMAGE_HEIGHT = "80px";  // 刺激画像の高さ
    var ID_FORM = "form";
    var FORM_HEIGHT = "60px";
    var FORM_WIDTH = "800px";
    var FORM_X = 40;
    var FORM_Y = 380;
    var ID_ANSWER = "answer";
    var ANSWER_SIZE = 5;
    var CORRECT = "Correct";
    var WRONG = "Wrong";
    var DIGIT = "digit";
    var SYMBOL = "symbol";
    var DISTRACTER_TYPES = [DIGIT, SYMBOL];
    var N_DISTRACTER = 8;
    var DISTRACTER_LETTER = {};
    DISTRACTER_LETTER[DIGIT] = ["2", "3", "4", "5", "6", "7", "8", "9"];
    DISTRACTER_LETTER[SYMBOL] = ["less", "grater", "equals", "number",
                                 "percent", "question", "slash", "asterisk"];
    var N_PRACTICE = 10;
    var N_TRIAL = 120;
    var SETSIZE = 13;

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = null;

    // [ 'A', 'B', ... ]
    var ALPHABET = "ABCEFGHJKLMNPRSTWXYZ".split("");

    // { digit: ["digit0", "digit1", ... ],
    //   symbol: ["symbol0", "symbol1", ... ] }
    var DISTRACTER = function () {
        var object = {};

        DISTRACTER_TYPES.forEach(function (type) {
            object[type] = 
                [type, IO.make_sequence(0, N_DISTRACTER - 1)].combine().map(
                    function(e) { return e[0] + e[1]; });
        });
        return object;
    }();

    // ALPHABETとDISTRACTERから画像読み込み用のリストを作る
    var IMAGES = function () {
        var src;

        // [ "A", "B", ..., "fix", "blank" ]
        src = ALPHABET.concat(["fix", "blank"]);
        // [ ["digit0", "2"], ["digit1", "3"], ..., ["symbol7", "asterisk"] ]
        DISTRACTER_TYPES.forEach(function (type) {
            DISTRACTER[type].forEach(function (distracter, i) {
                src.push([distracter, DISTRACTER_LETTER[type][i]]);
            });
        });
        return src;
    }();

    // ***** ブロック・試行・刺激の定義
    var make_trials = function (src) {
        var array = [];

        // srcは [ [t1pos, lag], ... ]
        src.forEach(function (s) {
            var t1, t2;
            // 異なるアルファベット2文字をランダムに選ぶ
            t1 = ALPHABET.select_randomly();
            do { t2 = ALPHABET.select_randomly(); } while (t1 == t2);
            // 設定するのはt1, t2, t1pos, t2pos, lagだけ
            // ディストラクタは実施時に生成
            array.push({ t1: t1, t2: t2, 
                         t1pos: s[0], t2pos: s[0] + s[1], lag: s[1],
                         answer1: null, answer2: null
                       });
        });
        return array;
    };

    var blocks = [
        // 同じディストラクター条件の練習と本実験は組にして実施するので配列にしておく
        // あとで全体をshuffleしたあとflatten1する
        [{ name: "練習(数字)",
           type: "practice_digit",
           distracter_type: DIGIT,
           trials: make_trials([[2, [1, 6]].combine(),
                                [3, [3, 1]].combine(),
                                [4, [5, 3]].combine(),
                                [5, [2, 5]].combine(),
                                [6, [4, 2]].combine()
                               ].flatten1())
         },
         { name: "本試行(数字)",
           type: "experiment_digit",
           distracter_type: DIGIT,
           breakpoint: null,
           trials: make_trials([[2, IO.make_sequence(1, 6)].combine().repeat(4),
                                [3, IO.make_sequence(1, 6)].combine().repeat(4),
                                [4, IO.make_sequence(1, 6)].combine().repeat(4),
                                [5, IO.make_sequence(1, 6)].combine().repeat(4),
                                [6, IO.make_sequence(1, 6)].combine().repeat(4)
                               ].flatten1())
         }],
        [{ name: "練習(記号)",
           type: "practice_symbol",
           distracter_type: SYMBOL,
           trials: make_trials([[2, [1, 6]].combine(),
                                [3, [3, 1]].combine(),
                                [4, [5, 3]].combine(),
                                [5, [2, 5]].combine(),
                                [6, [4, 2]].combine()
                               ].flatten1())
         },
         { name: "本試行(記号)",
           type: "experiment_symbol",
           distracter_type: SYMBOL,
           breakpoint: null,
           trials: make_trials([[2, IO.make_sequence(1, 6)].combine().repeat(4),
                                [3, IO.make_sequence(1, 6)].combine().repeat(4),
                                [4, IO.make_sequence(1, 6)].combine().repeat(4),
                                [5, IO.make_sequence(1, 6)].combine().repeat(4),
                                [6, IO.make_sequence(1, 6)].combine().repeat(4)
                               ].flatten1())
         }]
    ];

    // ***** 実験開始に先立って1回だけ実施する処理
    // 画像読込・実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
        var setup = function () {
            blocks = blocks.shuffle().flatten1();
            b = 0;
        };
        var set_screen = function () {
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, { textAlign: "left" });
            IO.display_instruction(
                "【Attentional Blink実験】",
                ["画面中央に＋が呈示されたあと数字か記号の系列が1つずつ高速で呈示されていきますが，その中に2つ，アルファベットが含まれています。系列の呈示が終わったらすぐに，記入欄に2つのアルファベットを呈示された順序通りに入力し、Enterを押してください。",
                 "呈示されるのは大文字ですが、入力は小文字でかまいません。1文字もわからなければ何も入力せずにEnterを押してください。1文字しかわからない場合は1文字だけ入力し、1文字めはわからないけれども2文字めを憶えている場合は1文字めの代わりにスペースを使って\" a\"のように入力してください(引用符を入力する必要はありません)。"],
                ID_MAIN);
        };
        setup();
        set_screen();
        block_prologue();
    };

    // ***** ブロックごとの開始時に実施する処理
    // ブロックごとの教示・試行実施順の決定など
    // do_first_trialを呼ぶこと
    var block_prologue = function () {
        var setup = function () {
            block = blocks[b];
            block.trials.shuffle();
            t = 0;
        };

        setup();
        if (block.type.match(/^experiment/)) {
            block.breakpoint = Math.floor(block.trials.length / 3);
        }
        IO.append_paragraph("スペースキーを押すと" + block.name + "を開始します。" +
                            "全部で" + block.trials.length + "試行あります。" +
                            (block.type.match(/^experiment/) ?
                             block.breakpoint + "試行ごとに休憩があります。" : ""),
                            ID_MAIN, "center");
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
            IO.append_element('img', ID_IMAGE,
                              { width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
                              ID_MAIN, "center");
            IO.clear(ID_IMAGE);
            div = IO.append_element('div', null,
                                    { width: FORM_WIDTH, height: FORM_HEIGHT,
                                      textAlign: "center" },
                                    ID_MAIN, FORM_X, FORM_Y );
            IO.set_html("<form id='" + ID_FORM + "'>答え: <input type='text' size='"
                        + ANSWER_SIZE + "' id='" + ID_ANSWER + "' maxlength='2'></form>",
                        div);
            document.getElementById(ID_FORM).onsubmit = function () { return false; };
            document.getElementById(ID_FORM).style.display = "none";
            document.getElementById(ID_FORM).onkeydown = set_result;
        };

        set_screen();
        IO.setTimeout(do_trial, T_ITI);
    };

    // ***** 1試行の実施
    // next_trialを呼ぶこと
    var do_trial = function () {
        // ディストラクタを挿入しながら刺激系列を作成
        var make_seq = function (setsize) {
            var seq = [];

            seq[-2] = seq[-1] = -1; // 番兵
            for (var i = 0; i < setsize; i++) {
                if (i === trial.t1pos)      { seq[i] = trial.t1; }
                else if (i === trial.t2pos) { seq[i] = trial.t2; }
                else { // ディストラクタ 同じ文字は3つ以上離す
                    do { seq[i] = DISTRACTER[block.distracter_type].select_randomly();
                    } while (seq[i] == seq[i - 1] || seq[i] == seq[i - 2]);
                }
            }
            return seq;
        };
        var make_stimuli = function (seq) {
            var stimuli = [[IMAGES.fix, T_FIX, ID_IMAGE],
                           [IMAGES.blank, T_BLANK, ID_IMAGE]];
            seq.forEach(function (s) {
                stimuli.push([IMAGES[s], T_SOA, ID_IMAGE]);
            });
            stimuli.push([IMAGES.blank, 0, ID_IMAGE]);
            return stimuli;
        };
        var setup = function () {
            trial = block.trials[t];
            trial.seq = make_seq(SETSIZE);
        };

        setup();
        if (DEBUG) {
            set_result();
        } else {
            IO.present_stimuli_and_wait_for_key(
                make_stimuli(trial.seq),
                [],
                do_trial2);
        }
    };

    var do_trial2 = function () {
        document.getElementById(ID_FORM).style.display = "";
        document.getElementById(ID_ANSWER).focus();
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶ
    var set_result = function (e) {
        var answer;

        if (DEBUG) {
            r = Math.random();
            if (r > 0.6) {
                trial.answer1 = trial.t1;
                trial.answer2 = trial.t2;
            } else if (r > 0.4) {
                trial.answer1 = trial.t1;
            } else if (r > 0.3) {
                trial.answer2 = trial.t2;
            } else if (r > 0.2) {
                trial.answer1 = trial.t2;
                trial.answer2 = trial.t1;
            }
            setTimeout(next_trial, 0);
        } else if (IO.keyCode(e) === IO.KEYCODE.ENTER) {
            document.getElementById(ID_FORM).style.display = "none";
            input = document.getElementById(ID_ANSWER);
            trial.answer1 = trial.answer2 = "";
            answer = input.value;
            if (answer.length > 0) { trial.answer1 = answer[0].toUpperCase(); }
            if (answer.length > 1) { trial.answer2 = answer[1].toUpperCase(); }
            input.value = "";
            setTimeout(next_trial, 0);
        }
        return true;
    };

    // ***** 次の試行に進む処理
    // ブロックが終わりならblock_epilogue、そうでなければdo_trialを呼ぶ
    var next_trial = function () {
        var advance = function () {
            t = t + 1;
            if (t >= block.trials.length) {
                t = 0; b = b + 1; IO.setTimeout(block_epilogue, T_ITI);
            } else {
                if (block.type.match(/^experiment/) && t % block.breakpoint === 0) {
                    IO.clear(ID_MAIN);
                    IO.set_element_style(ID_MAIN, {backgroundColor: CYAN,
                                                   textAlign: "center" } );
                    IO.append_paragraph("休憩です。準備ができたらスペースキーを押して続けてください。", ID_MAIN, "center");
                    IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
                } else {
                    IO.setTimeout(do_trial, T_ITI);
                }
            }
        };

        IO.clear(ID_IMAGE);
        advance();
    };

    var get_score = function (block) {
        var score = 0;

        block.trials.forEach(function (trial) {
            if ((trial.t1 === trial.answer1) && (trial.t2 === trial.answer2)) {
                score += 1;
            }
        });
        return Math.floor((score / block.trials.length) * 100);
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
        if (block.type.match(/^practice/)) {
            IO.append_paragraph("正解率は" + get_score(block) +
                                "%でした。できるだけ正確に答えてください。",
                                ID_MAIN, "center");
        }
        advance();
    };

    // ***** 全ブロック終了時に1回だけ実施する処理
    // データ保存など
    var epilogue = function () {
        var string = "";

        end_time = new Date();
        if (typeof SAVE_STYLE === 'undefined' || SAVE_STYLE !== 'verbose') {
            blocks.forEach(function (block) {
                if (block.type.match(/^experiment/)) { string += result_string(block); }
            });
            IO.save_data(TITLE, "", string, ID_MAIN, 'append');
        } else {
            string += "### " + TITLE + "\n";
            string += "### id = " + id + " sex = " + sex + "\n";
            string += "### start: " + start_time + "\n";
            blocks.forEach(function (block) {
                string += result_string(block);
            });
            string += "### end  : " + end_time + "\n";
            IO.save_data(TITLE, id, string, ID_MAIN);
        }
    };

    // ***** blockから結果記録用文字列を作成する
    var result_string = function (block) {
        var lag, str = "";
        var T1 = "t1", T2 = "t2", BOTH = "both", SW = "sw";
        var TYPES = [T1, T2, BOTH, SW];
        var value = [], lags = [], N = [];

        block.trials.forEach(function (trial) {
            // まだ出てきてないlagならlagsに記録して数値を初期化
            lag = trial.lag;
            if (lags.indexOf(lag) < 0) {
                lags.push(lag);
                value[lag] = {};
                TYPES.forEach(function (t) { value[lag][t] = 0; });
                N[lag] = 0;
            }
            // 各数値の計算
            N[lag] += 1;
            if (trial.answer1 === trial.t1) {
                value[lag][T1] += 1;
                if (trial.answer2 === trial.t2) { value[lag][BOTH] += 1; }
            }
            if (trial.answer2 === trial.t2) { value[lag][T2] += 1; }
            if (trial.answer1 === trial.t2 && trial.answer2 == trial.t1) {
                value[lag][SW] += 1;
            }
        });
        // 出てきたlagを数値順に並べかえ
        lags.sort_num();
        // lag順に計算した数値を出力
        if (typeof SAVE_STYLE === 'undefined' || SAVE_STYLE !== 'verbose') {
            str += [id, sex, block.distracter_type].join(DELIMITER);
            TYPES.forEach(function (type) {
                lags.forEach(function (lag) {
                    str += DELIMITER + (value[lag][type] / N[lag]).round_down(2);
                });
            });
            str += "\n";
        } else {
            lags.forEach(function (lag) {
                str += [block.name, block.distracter_type, lag, N[lag],
                        t1[lag], t2[lag], both[lag], sw[lag]].join(DELIMITER) + "\n";
            });
        }
        return str;
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
