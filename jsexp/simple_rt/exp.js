// simple RT
//
// 注視点のあと2文字のアルファベットを呈示し、2文字めに対する単純反応時間を測定
// 要因: 配置(ISIをブロック内配置, ブロック間配置) 
//       ISI(0, 200, 400)
//       キャッチ試行(あり, なし)

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "simple_rt";    // 結果データを保存するディレクトリ名に使われる
    var SAVE_STYLE = "summary"; // "verbose"だと詳細形式で保存
    var DELIMITER = "\t";       // 結果データのデリミタ
    var id, sex;                // 参加者情報
    var b = 0;                  // 実行中のblock番号(0からblocks.length-1まで)
    var block;                  // 実行中のblock
    var t = 0;                  // 実行中のtrial番号(0からblock.trials.length-1まで)
    var trial;                  // 実行中のtrial
    var start_time;
    var end_time;

    // ***** 実験固有の変数・定数
    var T_FIX = 200;            // 注視点呈示時間(ms)
    var T_BLANK = 200;          // 注視点から刺激までのISI(ms)
    var T_T1 = 500;             // 第1文字呈示時間(ms)
    var T_ITI = 1000;           // 試行間間隔(ms)
    var T_CATCH = 1000;         // キャッチ試行における終了までの待機時間(ms)
    var ID_MAIN = "main";       // 表示領域のID
    var MAIN_WIDTH = "800px";   // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";       // 表示領域の背景色(教示時)
    var WHITE = "#FFFFFF";      // 表示領域の背景色(実行時)
    var IMAGE_WIDTH = "80px";   // 刺激画像の幅
    var IMAGE_HEIGHT = "80px";  // 刺激画像の高さ
    var ID_LEFT = "left";       // 刺激画像のID
    var ID_RIGHT = "right";     // 刺激画像のID
    var LEFT_X = 360;           // 左刺激呈示位置のX座標 (880 / 2 - 80)
    var RIGHT_X = 440;          // 右刺激呈示位置のX座標 (880 / 2)
    var Y = 200;                // 刺激呈示位置のY座標 (480 / 2 - 80 / 2)
    var KEY_YES = IO.KEYCODE.J;
    var KEY_NO = IO.KEYCODE.F;
    var YES = "yes";
    var NO = "no";
    var CATCH_TRIALS = [YES, NO];
    var BETWEEN = "between";
    var WITHIN = "within";
    var DESIGNS = [BETWEEN, WITHIN];
    var ISIS = [0, 200, 400];
    var PRACTICE = "practice";
    var EXPERIMENT = "experiment";
    var CATCH = "catch";

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = null;
    var IMAGES = "ABFHMRabfhmr".split("").concat(['fix', 'mask', 'blank']);

    // ***** ブロック・試行・刺激の定義
    // 同じ刺激が何度も使われるので、文字のペアやISIはtrialsに直接格納せず
    // ここでオブジェクトとして作成しておき、それをtrialsに入れることにする
    var STIMULI = (function () {
        var pair_src = [
            "AA0 BB200 FF400 HH0 MM200 RR400".split(" "),
            "AB0 AF200 AH400 AM0 AR200 BA400".split(" "),
            "BF0 BH200 BM400 BR0 FA200 FB400".split(" "),
            "FH0 FM200 FR400 HA0 HB200 HF400".split(" "),
            "HM0 HR200 MA400 MB0 MF200 MH400".split(" "),
            "MR0 RA200 RB400 RF0 RH200 RM400".split(" "),
            "Aa0 Bb200 Ff400 Hh0 Mm200 Rr400".split(" "),
            "Ab0 Af200 Ah400 Am0 Ar200 Ba400".split(" "),
            "Bf0 Bh200 Bm400 Br0 Fa200 Fb400".split(" "),
            "Fh0 Fm200 Fr400 Ha0 Hb200 Hf400".split(" "),
            "Hm0 Hr200 Ma400 Mb0 Mf200 Mh400".split(" "),
            "Mr0 Ra200 Rb400 Rf0 Rh200 Rm400".split(" ")
        ].flatten1();
        var catch_src = "ABFHMR".split("");
        var obj = {};

        pair_src.forEach(function (s) {
            obj[s] = { name: s,
                       left: s.substr(0, 1),
                       right: s.substr(1, 1),
                       isi: parseInt(s.substr(2), 10) };
        });
        catch_src.forEach(function (s) {
            obj[s + "_catch"] = { name: s + "_catch",
                                  left: s,
                                  right: "blank",
                                  isi: CATCH };
        });
        return obj;
    }());

    var blocks = [
        // Within
        { name: "練習wc1", type: PRACTICE, design: WITHIN, catch_trial: YES,
          trials: "Aa0 FM200 BA400 H_catch" },
        { name: "本試行wc1", type: EXPERIMENT, design: WITHIN, catch_trial: YES,
          trials: "AA0 Fm200 Ba400 Hh0 HB200 BM400 AB0 Hr200 Fb400 AM0 BB200 Fr400 Bf0 Mm200 HF400 BR0 AF200 Ma400 A_catch B_catch F_catch H_catch M_catch R_catch" },

        { name: "練習wc2", type: PRACTICE, design: WITHIN, catch_trial: YES,
          trials: "Am0 Bb200 FR400 M_catch" },
        { name: "本試行wc2", type: EXPERIMENT, design: WITHIN, catch_trial: YES,
          trials: "FH0 AR200 FF400 Ha0 Bh200 Rr400 HM0 FA200 AH400 Aa0 FM200 BA400 HH0 Hb200 Bm400 Ab0 HR200 FB400 A_catch B_catch F_catch H_catch M_catch R_catch" },

        { name: "練習wc3", type: PRACTICE, design: WITHIN, catch_trial: YES,
          trials: "Fh0 Ar200 Ff400 R_catch" },
        { name: "本試行wc3", type: EXPERIMENT, design: WITHIN, catch_trial: YES,
          trials: "Am0 Bb200 FR400 BF0 MM200 Hf400 Br0 Af200 MA400 Fh0 Ar200 Ff400 HA0 BH200 RR400 Hm0 Fa200 Ah400 A_catch B_catch F_catch H_catch M_catch R_catch" },

        { name: "練習wn1", type: PRACTICE, design: WITHIN, catch_trial: NO,
          trials: "Aa0 FM200 BA400" },
        { name: "本試行wn1", type: EXPERIMENT, design: WITHIN, catch_trial: NO,
          trials: "AA0 Fm200 Ba400 Hh0 HB200 BM400 AB0 Hr200 Fb400 AM0 BB200 Fr400 Bf0 Mm200 HF400 BR0 AF200 Ma400" },

        { name: "練習wn2", type: PRACTICE, design: WITHIN, catch_trial: NO,
          trials: "Am0 Bb200 FR400" },
        { name: "本試行wn2", type: EXPERIMENT, design: WITHIN, catch_trial: NO,
          trials: "FH0 AR200 FF400 Ha0 Bh200 Rr400 HM0 FA200 AH400 Aa0 FM200 BA400 HH0 Hb200 Bm400 Ab0 HR200 FB400" },

        { name: "練習wn3", type: PRACTICE, design: WITHIN, catch_trial: NO,
          trials: "Fh0 Ar200 Ff400" },
        { name: "本試行wn3", type: EXPERIMENT, design: WITHIN, catch_trial: NO,
          trials: "Am0 Bb200 FR400 BF0 MM200 Hf400 Br0 Af200 MA400 Fh0 Ar200 Ff400 HA0 BH200 RR400 Hm0 Fa200 Ah400" },


        // Between
        { name: "練習bc1", type: PRACTICE, design: BETWEEN, catch_trial: YES,
          trials: "Aa0 Am0 Fh0 B_catch" },
        { name: "本試行bc1", type: EXPERIMENT, design: BETWEEN, catch_trial: YES,
          trials: "AA0 AM0 FH0 Aa0 Am0 Fh0 Hh0 Bf0 Ha0 HH0 BF0 HA0 AB0 BR0 HM0 Ab0 Br0 Hm0 A_catch B_catch F_catch H_catch M_catch R_catch" },

        { name: "練習bc2", type: PRACTICE, design: BETWEEN, catch_trial: YES,
          trials: "Fm200 Bb200 Ar200 R_catch" },
        { name: "本試行bc2", type: EXPERIMENT, design: BETWEEN, catch_trial: YES,
          trials: "Fm200 BB200 AR200 FM200 Bb200 Ar200 HB200 Mm200 Bh200 Hb200 MM200 BH200 Hr200 AF200 FA200 HR200 Af200 Fa200 A_catch B_catch F_catch H_catch M_catch R_catch" },

        { name: "練習bc3", type: PRACTICE, design: BETWEEN, catch_trial: YES,
          trials: "Ba400 FR400 Ff400 H_catch" },
        { name: "本試行bc3", type: EXPERIMENT, design: BETWEEN, catch_trial: YES,
          trials: "BM400 HF400 Rr400 Bm400 Hf400 RR400 Ba400 Fr400 FF400 BA400 FR400 Ff400 Fb400 Ma400 AH400 FB400 MA400 Ah400 A_catch B_catch F_catch H_catch M_catch R_catch" },

        { name: "練習bn1", type: PRACTICE, design: BETWEEN, catch_trial: NO,
          trials: "Aa0 Am0 Fh0" },
        { name: "本試行bn1", type: EXPERIMENT, design: BETWEEN, catch_trial: NO,
          trials: "AA0 AM0 FH0 Aa0 Am0 Fh0 Hh0 Bf0 Ha0 HH0 BF0 HA0 AB0 BR0 HM0 Ab0 Br0 Hm0" },

        { name: "練習bn2", type: PRACTICE, design: BETWEEN, catch_trial: NO,
          trials: "Fm200 Bb200 Ar200" },
        { name: "本試行bn2", type: EXPERIMENT, design: BETWEEN, catch_trial: NO,
          trials: "Fm200 BB200 AR200 FM200 Bb200 Ar200 HB200 Mm200 Bh200 Hb200 MM200 BH200 Hr200 AF200 FA200 HR200 Af200 Fa200" },

        { name: "練習bn3", type: PRACTICE, design: BETWEEN, catch_trial: NO,
          trials: "Ba400 FR400 Ff400" },
        { name: "本試行bn3", type: EXPERIMENT, design: BETWEEN, catch_trial: NO,
          trials: "BM400 HF400 Rr400 Bm400 Hf400 RR400 Ba400 Fr400 FF400 BA400 FR400 Ff400 Fb400 Ma400 AH400 FB400 MA400 Ah400" }

    ];

    // 全ブロックのtrialsを展開して置き換える
    blocks.forEach(function (block) {
        var array = block.trials.split(" ");

        block.trials = [];
        array.forEach(function (trial_name) {
            block.trials.push({ stimulus: STIMULI[trial_name], rt: null } );
        });
    });

    // 同じ条件の練習と実験は対にして実施し、Catchありの3条件とCatchな
    // しの3条件はそれぞれ連続して実施する。そのうえでCatchありとなしの
    // どちらを先に実施するか、Catchあり内の3条件およびCatchなし内の3条
    // 件をどの順で実施するかはランダムにしたい。そこで、そのようにデー
    // タをまとめた配列を作っておき、prologueの中でランダム化してそれに
    // もとづきblocksを再設定する。

    var OPTION = { condition: ["条件",
                               [{name: "1", longname: "内-Catch先",
                                 value: 0, design: WITHIN},
                                {name: "2", longname: "内-Catch後",
                                 value: 1, design: WITHIN},
                                {name: "3", longname: "間-Catch先",
                                 value: 2, design: BETWEEN},
                                {name: "4", longname: "間-Catch後",
                                 value: 3, design: BETWEEN}
                               ]] };

    var block_order_src = [
        // OPTION.condition.value = 0,  内-Catch先
        [ [[0, 1], [2, 3], [4, 5]],       [[6, 7], [8, 9], [10, 11]] ],
        // OPTION.condition.value = 1,  内-Catch後
        [ [[6, 7], [8, 9], [10, 11]],     [[0, 1], [2, 3], [4, 5]] ],
        // OPTION.condition.value = 2,  間-Catch先
        [ [[12, 13], [14, 15], [16, 17]], [[18, 19], [20, 21], [22, 23]] ],
        // OPTION.condition.value = 3,  間-Catch後
        [ [[18, 19], [20, 21], [22, 23]], [[12, 13], [14, 15], [16, 17]] ]
    ];

    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
        IO.select_option("条件を選んでください", ID_MAIN, OPTION, prologue2);
    };

    var prologue2 = function () {
        var setup = function () {
            var block_order, new_blocks;

            // ブロック実施順の決定
            block_order = block_order_src[OPTION.condition.value];
            // この時点ではたとえば [ [[6,7], [8,9], [10,11]], [[0,1], [2,3], [4,5]] ]
            block_order.forEach(function (bo) {
                // Catchあり(なし)内の3条件をランダム化
                bo.shuffle();
            });
            // 入れ子を外す
            block_order = block_order.flatten1().flatten1();
            // この時点ではたとえば [ 8, 9,  6, 7,  10, 11,  2, 3,  4, 5,  0, 1 ]
            // この順にblocksを再構成
            new_blocks = [];
            block_order.forEach(function (b) { new_blocks.push(blocks[b]); });
            blocks = new_blocks;
            b = 0;
        };
        var set_screen = function () {
            IO.clear(ID_MAIN);
            IO.display_instruction(
                "【単純反応時間】",
                ["まず画面に*が2つ並んで表示されます。次に左側にアルファベットが1文字表示され、しばらくすると消えます。そのあと右側にアルファベットが1文字表示されます。",
                 "右側(2文字め)のアルファベットが表示されたらできるだけ早くスペースキーを押してください。ただし、タイミングを予想するのではなく、あくまで表示に対して反応してください。"],
                ID_MAIN,
                "left");
        };

        setup();
        set_screen();
        block_prologue();
    };

    // ***** ブロックごとの開始時に実施する処理
    // ブロックごとの教示・試行実施順の決定など
    // do_first_trialを呼ぶこと
    var block_prologue = function () {
        var msg;
        var setup = function () {
            var count;

            block = blocks[b];
            count = 0;
            do {
                block.trials.shuffle();
                // キャッチ試行は3連続しないように
                block.trials.forEach(function (trial) {
                    if (trial.stimulus.isi === 'catch') {
                        count = count + 1;
                        if (count >= 3) { return; }
                    } else {
                        count = 0;
                    }
                });
            } while (count >= 3);
            t = 0;
        };

        setup();
        msg = "";
        IO.set_element_style(ID_MAIN, "center");
        IO.append_paragraph(
             "スペースキーを押すと第" + (Math.floor(b / 2) + 1) + "ブロックの" +
                (block.type === PRACTICE ? "練習" : "本試行") +
                "を始めます。全部で" + block.trials.length + "試行あります。",
            ID_MAIN);
        IO.append_paragraph(
            (block.catch_trial === YES) ?
                "このブロックでは、課題によって第2文字が出ない場合があります。そのときはそのまま待っていれば自動的に次の課題が始まります。" :
                "このブロックでは、すべての課題で第2文字が出てきます。",
            ID_MAIN,
            (block.catch_trial === YES) ? "left" : "");
        IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
    };

    // ***** ブロック最初の試行に先立って実施する処理
    // 表示領域の準備など
    // do_trialを呼ぶこと
    var do_first_trial = function () {
        var set_screen = function () {
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, { backgroundColor: WHITE });
            IO.append_element('img', ID_LEFT, {width: IMAGE_WIDTH, height: IMAGE_HEIGHT},
                              ID_MAIN, LEFT_X, Y);
            IO.append_element('img', ID_RIGHT, {width: IMAGE_WIDTH, height: IMAGE_HEIGHT},
                              ID_MAIN, RIGHT_X, Y);
        };

        set_screen();
        IO.setTimeout(do_trial, T_ITI);
    };

    // ***** 1試行の実施
    // next_trialを呼ぶこと
    var do_trial = function () {
        var stimuli;
        var setup = function () {
            trial = block.trials[t];
        };

        setup();
        stimuli = 
            [[IMAGES.fix, 0, ID_LEFT],
             [IMAGES.fix, T_FIX, ID_RIGHT],
             [IMAGES.blank, 0, ID_LEFT],
             [IMAGES.blank, T_BLANK, ID_RIGHT],
             [IMAGES[trial.stimulus.left], T_T1, ID_LEFT]];
        if (trial.stimulus.isi === 'catch') {
            stimuli.push([IMAGES.mask, T_CATCH, ID_LEFT, false]);
        } else {
            stimuli.push([IMAGES.mask, trial.stimulus.isi, ID_LEFT]);
            stimuli.push([IMAGES[trial.stimulus.right], -1, ID_RIGHT]);
        }
        IO.present_stimuli_and_wait_for_key(stimuli,
                                            ((trial.stimulus.isi === 'catch') ?
                                             [] : [IO.KEYCODE.SPACE]),
                                            set_reaction);
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶ
    var set_reaction = function (keycode, rt) {
        trial.rt = rt;
        next_trial();
    };

    // ***** 次の試行に進む処理
    // ブロックが終わりならblock_epilogue、そうでなければdo_trialを呼ぶ
    var next_trial = function () {
        var advance = function () {
            t = t + 1;
            if (t >= block.trials.length) {
                t = 0; b = b + 1;
                IO.setTimeout(block_epilogue, T_ITI);
            } else {
                IO.setTimeout(do_trial, T_ITI);
            }
        };

        IO.clear(ID_LEFT);
        IO.clear(ID_RIGHT);
        return advance();
    };

    // ***** ブロック終了時に実施する処理
    // 実験が終わりならblock_prologue、そうでなければepilogueを呼ぶ
    // この関数が呼ばれた時点でbとtは既に進められているので注意
    // (blockとtrialは更新されていない)
    var block_epilogue = function () {
        var set_screen = function () {
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
        var string = "", trials, _trials;

        end_time = new Date();
        if (typeof SAVE_STYLE === 'undefined' || SAVE_STYLE !== 'verbose') {
            // 結果を条件ごとにまとめなおす
            trials = {};
            blocks.forEach(function (block) {
                if (block.type === PRACTICE) { return; }
                trials.init_property(block.catch_trial, {});
                block.trials.forEach(function (trial) {
                    trials[block.catch_trial].init_property(trial.stimulus.isi, []);
                    trials[block.catch_trial][trial.stimulus.isi].push(trial);
                });
            });
            // 出力
            string += [id, sex, OPTION.condition.design].join(DELIMITER);
            CATCH_TRIALS.forEach(function (c) {
                ISIS.forEach(function (isi) {
                    _trials = trials[c][isi];
                    // 試行名順に並びかえ
                    _trials.sort(function (a, b) {
                        if (a.name < b.name) { return -1; }
                        else if (a.name > b.name) { return 1; }
                        else { return 0; }
                    });
                    // 出力
                    _trials.forEach(function (trial) {
                        string += DELIMITER + trial.rt;
                    });
                });
            });
            string += "\n";
            IO.save_data(TITLE, "", string, ID_MAIN, "append");
        } else {
            string += "### " + TITLE + "\n";
            string += "### id = " + id + " sex = " + sex + "\n";
            string += "### condition = " + OPTION.condition.value + " " +
                OPTION.condition.longname + "\n";
            string += "### start: " + start_time + "\n";
            blocks.forEach(function (block) {
                block.trials.forEach(function (trial) {
                    string += [block.type, block.design, block.catch_trial,
                               trial.stimulus.name, trial.stimulus.isi,
                               trial.rt].join(DELIMITER) + "\n";
                });
            });
            string += "### end  : " + end_time + "\n";
            IO.clear(ID_MAIN);
            IO.save_data(TITLE, id, string, ID_MAIN);
        }
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
