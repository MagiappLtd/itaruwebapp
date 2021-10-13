// memory_span within
//
// メモリスパンの測定(被験者内)

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "memory_span_within";   // 結果データを保存するディレクトリ名に使われる
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
    var T_FIX = 1000;                   // 注視点呈示時間(ms)
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
    var ANSWER_SIZE = 20;
    var INITIAL_SET_SIZE = 4;
    var CORRECT = "Correct";
    var WRONG = "Wrong";
    var PRACTICE = "practice";
    var EXPERIMENT = "experiment";

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = ["chime", "boo"];
    var IMAGES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                 'fix', 'blank', 'question'];

    // ***** ブロック・試行・刺激の定義
    var make_trials = function (n) {
        var i, array = [];

        for (i = 0; i < n; i++) {
            array.push({ n: i, seq: null, setsize: null, span: null,
                         answer: null, result: null });
        }
        return array;
    };

    // 同一soaの練習と本試行を組にして実施したいので2つずつ配列に入れておく
    // あとでshuffleしたあとflatten1する
    var blocks = [
        [{ name: "練習",   type: PRACTICE,   soa: 200, trials: make_trials(3) },
         { name: "本試行", type: EXPERIMENT, soa: 200, trials: make_trials(6) }],
        [{ name: "練習",   type: PRACTICE,   soa: 300, trials: make_trials(3) },
         { name: "本試行", type: EXPERIMENT, soa: 300, trials: make_trials(6) }],
        [{ name: "練習",   type: PRACTICE,   soa: 400, trials: make_trials(3) },
         { name: "本試行", type: EXPERIMENT, soa: 400, trials: make_trials(6) }]
    ];

    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
        var setup = function () {
            blocks = blocks.shuffle().flatten1();
            b = 0;
        };
        var set_screen = function () {
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, { textAlign: "left" });
            IO.display_instruction("【Memory Span実験】",
                                   ["画面中央に１つずつ数字が呈示されていきます。呈示が終わったらすぐに，下の空欄にその数字を，12345のように呈示順に記入してください。数字の記入はキーボード右側のテンキーで行ってください。記入後，Enterキーを押すと正誤が確認できます。そしてもう一度Enterキーを押すと，次の数字列の呈示に進みます。",
                                    ["3種の呈示間隔条件があり、それぞれ練習と本試行があります。", "center"]],
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
        if (block.type === PRACTICE) {
            IO.append_paragraph("スペースキーを押すと" +
                                ((b > 0) ? "次の条件の" : "") +
                                "短い" + block.name + "を開始します。",
                                ID_MAIN, "center");
        } else {
            IO.append_paragraph("スペースキーを押すと" + block.name + "を開始します。",
                                ID_MAIN, "center");
        }
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
                        + ANSWER_SIZE + "' id='" + ID_ANSWER + "'></form>",
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
        var setup = function () {
            trial = block.trials[t];
            trial.setsize = INITIAL_SET_SIZE;
        };

        setup();
        do_trial2();
    };

    // 刺激系列の呈示
    var do_trial2 = function () {
        var make_seq = function (setsize) {
            var i, seq = [];
            seq[-2] = seq[-1] = -1;
            for (i = 0; i < setsize; i++) {
                do {
                    seq[i] = IO.make_random_number(0, 9);
                } while (seq[i] == seq[i - 1] || seq[i] == seq[i-2]);
            }
            return seq;
        };
        var make_stimuli = function (seq) {
            var stimuli = [[IMAGES.fix, T_FIX, ID_IMAGE]];

            seq.forEach(function (s) {
                stimuli.push([IMAGES["" + s], block.soa, ID_IMAGE]);
            });
            stimuli.push([IMAGES.question, 0, ID_IMAGE]);
            return stimuli;
        };
        
        trial.seq = make_seq(trial.setsize);

        IO.present_stimuli_and_wait_for_key(
            make_stimuli(trial.seq),
            [],
            do_trial3);
    };

    // 反応待ち
    var do_trial3 = function () {
        document.getElementById(ID_FORM).style.display = "";
        document.getElementById(ID_ANSWER).focus();
        if (DEBUG) {
            set_result();
        }
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶ
    var set_result = function (e) {
        var r;
        if (DEBUG) {
            // デバッグ用にダミーデータを保存
            r = Math.random();
            if (r > ((trial.setsize - 4) / 6)) {
                // 正答ならセットサイズを1増やして系列呈示へ
                trial.answer = trial.seq.join('');
                trial.setsize += 1;
                setTimeout(do_trial2, 0);
            } else {
                // 誤答ならメモリスパンを記録して次の試行へ
                trial.span = trial.setsize - 0.5;
                setTimeout(next_trial, 0);
            }
        } else if (IO.keyCode(e) === IO.KEYCODE.ENTER) {
            document.getElementById(ID_FORM).style.display = "none";
            input = document.getElementById(ID_ANSWER);
            trial.answer = input.value.replace(/[^0-9]/g, "");
            input.value = "";
            if (trial.seq.join('') === trial.answer) {
                // 正答ならセットサイズを1増やして系列呈示へ
                AUDIOS["chime"].play();
                trial.setsize += 1;
                setTimeout(do_trial2, 0);
            } else {
                // 誤答ならメモリスパンを記録して次の試行へ
                AUDIOS["boo"].play();
                trial.span = trial.setsize - 0.5;
                setTimeout(next_trial, 0);
            }
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
                IO.setTimeout(do_trial, T_ITI);
            }
        };

        advance();
    };

    // ***** ブロック終了時に実施する処理
    // 実験が終わりならblock_prologue、そうでなければepilogueを呼ぶ
    // この関数が呼ばれた時点でbとtは既に進められているので注意
    // (blockとtrialは更新されていない)
    var block_epilogue = function () {
        var set_screen = function () {
            IO.clear(ID_IMAGE);
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, {backgroundColor: CYAN, textAlign: "center"});
        };
        var advance = function () {
            if (b < blocks.length) { block_prologue(); }
            else { epilogue(); }
        };

        set_screen();
        block.mean_span = 0;
        block.trials.forEach(function (trial) {
            block.mean_span += trial.span;
        });
        block.mean_span = (block.mean_span / block.trials.length).round_down(2);
        IO.append_paragraph("あなたのメモリスパンは" + block.mean_span + "です。",
                            ID_MAIN);
        advance();
    };

    // ***** 全ブロック終了時に1回だけ実施する処理
    // データ保存など
    var epilogue = function () {
        var string = "";

        end_time = new Date();
        if (typeof SAVE_STYLE === "undefined" || SAVE_STYLE !== "verbose") {
            blocks.forEach(function (block) {
                if (block.type === EXPERIMENT) {
                    string += [id, sex,
                               block.soa, block.mean_span].join(DELIMITER) + "\n";
                }
            });
            IO.save_data(TITLE, "", string, ID_MAIN, "append");
        } else {
            string += "### " + TITLE + "\n";
            string += "### id = " + id + " sex = " + sex + "\n";
            string += "### start: " + start_time + "\n";
            blocks.forEach(function (block) {
                block.trials.forEach(function (trial) {
                    string += [block.name, block.soa, trial.span].join(DELIMITER) + "\n";
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
