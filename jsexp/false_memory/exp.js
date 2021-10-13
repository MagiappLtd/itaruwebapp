// false_memory
//
// 虚記憶

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "false_memory"; // 結果データを保存するディレクトリ名に使われる
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
    var T_FIX = 300;            // 注視点呈示時間(ms)
    var T_PRE = 500;            // 注視点と単語のISI(ms)
    var T_WORD = 2000;          // 学習時の単語呈示時間(ms)
    var T_IWI = 1000;           // 学習時の単語間感覚(ms)
    var T_ILI = 4000;           // 学習時のリスト間間隔(ms)
    var T_ITI = 1000;           // 再認時の試行間間隔(ms)
    var T_DELAY = 1000*60;      // 妨害課題の継続時間(ms)
    var ID_MAIN = "main";       // 表示領域のID
    var MAIN_WIDTH = "800px";   // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";       // 表示領域の背景色
    var WHITE = "#FFFFFF";      // 表示領域の背景色
    var ID_CENTER = "center";   // 刺激呈示領域のID
    var CENTER_WIDTH = "800px"; // 刺激呈示領域の幅
    var CENTER_HEIGHT = "48px"; // 刺激呈示領域の高さ
    var CENTER_FONTSIZE = "48px";       // 刺激呈示領域のフォントサイズ
    var KEY_YES = IO.KEYCODE.J;
    var KEY_NO = IO.KEYCODE.F;
    var YES = "Yes";
    var NO = "No";
    var HIT = "Hit";
    var MISS = "Miss";
    var FALSE_ALARM = "FA";
    var CORRECT_REJECTION = "CR";
    var TARGET_POSITIONS = [ 1, 4, 6, 8 ];
    var LEARNING = "learning";
    var TEST = "test";
    var LURE = "Lure";
    var TARGET = "Target";
    var DISTRACTOR = "Distractor";
    var SUBTRACTION_START = 1000;       // 妨害課題で引き算を開始する数値
    var SUBTRACTION_STEP = 3;           // 妨害課題で引き算していく数

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = ["chime", "boo"];
    var IMAGES = null;

    // ***** ブロック・試行・刺激の定義
    // 学習ブロックだけをランダム順にしたいので配列に入れておく
    // prologueでblocks[0].shuffleのあとflatten1()
    var blocks = [
        [{ name: "リスト1", type: LEARNING, lure: "悪魔",
           trials: ["黒", "サタン", "怖い", "天使", "魔女", "悪い", "お化け",
                    "善人", "鬼", "醜い", "悪人", "デビル", "恐ろしい", "妖精", "神"] },
         { name: "リスト2", type: LEARNING, lure: "電波",
           trials: ["ラジオ", "波長", "テレビ", "電気", "電信", "無線", "見えない",
                    "短波", "電子", "放送", "アンテナ", "電報", "通信", "波", "流れる"] },
         { name: "リスト3", type: LEARNING, lure: "聞く",
           trials: ["話す", "読む", "講義", "音楽", "耳", "噂", "講演", "尋ねる",
                    "書く", "言う", "見る", "音", "レコード", "話", "ニュース"] },
         { name: "リスト4", type: LEARNING, lure: "希望",
           trials: ["将来", "夢", "大きい", "未来", "大志", "望み", "明るい", "光",
                    "ふくらむ", "素晴らしい", "高い", "楽しい", "失望", "理想", "人生"] }
        ],
        { name: "再認", type: TEST }
    ];

    var N_LEARNING_LIST = blocks[0].length; // 単語リストの数

    var DISTRACTOR =
        ["運動会 歩く 速い 犬 ランナー 自動車 陸上 逃げる 自転車 競走".split(" "),
         "マラソン 電車 リレー 止まる 鳩 戦争 広島 世界 愛 憲法".split(" "),
         "緑 国連 のどか 安全 望む 自由 日本 穏やか 長崎 挨拶".split(" "),
         "おじぎ エチケット 正しい 守る 大切 道徳 固苦しい 茶道 必要 作法".split(" "),
         "躾 丁寧 先生 正しさ".split(" ")].flatten1();

    // 再認用単語リストの作成
    blocks[1].trials = function () {
        var list = [], ok, n = 0;
        var push = function(block, word, type) {
            list.push({block: block, n: n, word: word, type: type});
            n = n + 1;
        };

        // ルアー語を格納
        blocks[0].forEach(function (block, b) { push(b, block.lure, LURE); });
        // ターゲット語を格納
        blocks[0].forEach(function (block, b) {
            TARGET_POSITIONS.forEach(function (target_position) {
                push(b, block.trials[target_position], TARGET);
            });
        });
        // ディストラクタ語
        DISTRACTOR.forEach(function (d) { push(blocks.length - 1, d, DISTRACTOR); });
        list[-3] = list[-2] = list[-1] = { block: -1 }; // 番兵
        // 同じリストからの語は3単語以上間隔が空くように配置する
        do {
            list.shuffle(); // とりあえず混ぜてみて
            ok = true;
            list.forEach(function (word, i) {
                if (word.block !== blocks.length - 1 &&  // 非distractorの
                    (word.block === list[i - 1].block || // 3以内に同リスト語があれば
                     word.block === list[i - 2].block ||
                     word.block === list[i - 3].block)) {
                    ok = false; // ダメなのでやりなおし
                    return;
                }
            });
        } while (ok === false);
        return list;
    }();

    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
        var setup = function () {
            b = 0;
            blocks[0].shuffle();
            blocks = blocks.flatten1();
        };

        setup();
        IO.clear(ID_MAIN);
        IO.display_instruction("【False Memory実験】",
                               [["画面中央に単語が1つずつ呈示されます。できるだけたくさんの単語を覚えてください。", "center"],
                                ["スペースキーを押すと開始します。", "center"]],
                               ID_MAIN);
        IO.wait_for_key(IO.KEYCODE.SPACE, block_prologue);
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
        if (block.type === LEARNING) {
            do_first_trial();
        } else {
            IO.clear(ID_MAIN);
            IO.display_instruction("",
                                   [["画面中央に単語が1つずつ呈示されます。さきほど呈示された中にあった単語の場合は右手の人差し指で【J】のキーを，なかった単語の場合左手の人差し指で【F】のキーを押してください。すると次の単語が呈示されます。", "left"],
                                    ["スペースキーを押すと開始します。全部で" +
                                     block.trials.length + "試行あります。",
                                     "center"]],
                                   ID_MAIN);
            IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
        }
    };

    // ***** ブロック最初の試行に先立って実施する処理
    // 表示領域の準備など
    // do_trialを呼ぶこと
    var do_first_trial = function () {
        var set_screen = function () {
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, { backgroundColor: WHITE });
            IO.append_element('div', ID_CENTER,
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
        var fix = [["＊＊", T_FIX, ID_CENTER],
                   ["", T_PRE, ID_CENTER]];
        var seq;
        var setup = function () {
            trial = block.trials[t];
        };

        setup();
        if (block.type === LEARNING) {
            if (t === 0) { seq = fix; } // リスト最初の単語だけ注視点を出す
            else { seq = []; }
            IO.present_stimuli_and_wait_for_key(
                seq.concat([[trial, T_WORD, ID_CENTER],
                            ["", T_IWI, ID_CENTER]]),
                [],
                next_trial);
        } else {
            IO.present_stimuli_and_wait_for_key(
                [["＊＊", T_FIX, ID_CENTER],
                 ["", T_PRE, ID_CENTER],
                 [trial.word, -1, ID_CENTER]],
                [KEY_YES, KEY_NO],
                set_reaction);
        }
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶこと
    var set_reaction = function (keycode, rt) {
        if (keycode === KEY_YES) {
            trial.answer = YES;
            trial.result = (trial.type === TARGET) ? HIT : FALSE_ALARM;
        } else if (keycode === KEY_NO) {
            trial.answer = NO;
            trial.result = (trial.type === TARGET) ? MISS : CORRECT_REJECTION;
        }
        trial.rt = rt;
        next_trial();
    };

    // ***** 次の試行に進む処理
    // ブロックが終わりならblock_epilogue、そうでなければdo_trialを呼ぶこと
    var next_trial = function (keycode, rt) {
        var advance = function () {
            t = t + 1;
            if (t >= block.trials.length) {
                t = 0; b = b + 1; IO.setTimeout(block_epilogue, T_ITI);
            } else {
                if (block.type === TEST) { IO.setTimeout(do_trial, T_ITI); }
                else { do_trial(); }
            }
        };

        IO.clear(ID_CENTER);
        if (block.type === TEST) {
            if (trial.result === HIT || trial.result == CORRECT_REJECTION) {
                AUDIOS["chime"].play();
            } else {
                AUDIOS["boo"].play();
            }
        }
        advance();
    };

    // ***** ブロック終了時に実施する処理
    // 実験が終わりならblock_prologue、そうでなければepilogueを呼ぶ
    // この関数が呼ばれた時点でbとtは既に進められているので注意
    // (blockとtrialは更新されていない)
    var block_epilogue = function () {
        IO.clear(ID_MAIN);
        if (b === N_LEARNING_LIST) { // bは既に1増えているのでこれでOK
            IO.set_element_style(ID_MAIN, {backgroundColor: CYAN, textAlign: "center"});
            IO.append_paragraph("この表示がされている間、" + SUBTRACTION_START +
                                "から" + SUBTRACTION_STEP + "ずつ引いた数を、" +
                                (SUBTRACTION_START - SUBTRACTION_STEP) + "・" +
                                (SUBTRACTION_START - (SUBTRACTION_STEP * 2)) + "・" +
                                (SUBTRACTION_START - (SUBTRACTION_STEP * 3)) +
                                "のように順に思いうかべてください。" + (T_DELAY / 1000) +
                                "秒たつと自動的に次の課題が始まります。",
                                ID_MAIN,
                                "left");
            if (DEBUG) {
                setTimeout(block_epilogue2, 1000);
            } else {
                IO.setTimeout(block_epilogue2, T_DELAY);
            }
        } else {
            IO.setTimeout(block_epilogue2, 0);
        }
    };

    var block_epilogue2 = function () {
        if (b < blocks.length) {
            block_prologue();
        } else {
            epilogue();
        }
    };

    // ***** 全ブロック終了時に1回だけ実施する処理
    // データ保存など
    var epilogue = function () {
        var string = "";

        end_time = new Date();
        IO.clear(ID_MAIN);
        IO.set_element_style(ID_MAIN, { backgroundColor: CYAN, textAlign: "center" } );
        if (typeof SAVE_STYLE === 'undefined' || SAVE_STYLE !== 'verbose') {
            blocks.forEach(function (block) {
                var results = [];

                if (block.type !== TEST) { return; }
                // 結果を条件ごとにまとめる
                block.trials.forEach(function (trial) {
                    if (trial.result === HIT || trial.result === CORRECT_REJECTION) {
                        results[trial.n] = 1;
                    } else {
                        results[trial.n] = 0;
                    }
                });
                // 出力
                string += [id, sex].join(DELIMITER);
                results.forEach(function (result) {
                    string += DELIMITER + result;
                });
                string += "\n";
            });
            IO.save_data(TITLE, "", string, ID_MAIN, 'append');
        } else {
            string += "### " + TITLE + "\n";
            string += "### id = " + id + " sex = " + sex + "\n";
            string += "### start: " + start_time + "\n";
            blocks.forEach(function (block) {
                block.trials.forEach(function (trial) {
                    string += result_string(block, trial);
                });
            });
            string += "### end  : " + end_time + "\n";
            IO.save_data(TITLE, id, string, ID_MAIN);
        }
    };

    // ***** blockとtrialから結果記録用文字列を1試行分作成する
    var result_string = function (block, trial) {
        if (block.type === TEST) {
            return [block.name, 
                    trial.n, trial.word,
                    trial.block, trial.type, 
                    trial.answer, trial.result, trial.rt].join(DELIMITER) + "\n";
        } else {
            return [block.name,block.type,trial].join(DELIMITER) + "\n";
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
