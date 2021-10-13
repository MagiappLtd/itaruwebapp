// sperling
//
// 全体報告/部分報告による感覚記憶の実験

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "sperling";     // 結果データを保存するディレクトリ名に使われる
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
    var T_FIX = 2000;           // 注視点呈示から消失まで(ms)
    var T_BLANK = 2000;         // 注視点消失から刺激呈示まで(ms)
    var T_PRESENT = 50;         // 刺激呈示から消失まで(ms)
    var T_ITI = 0;              // 試行間間隔(ms)
    var ID_MAIN = "main";       // 表示領域の幅
    var MAIN_WIDTH = "800px";   // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";       // 表示領域の背景色
    var WHITE = "#FFFFFF";      // 表示領域の背景色
    var ID_IMAGE = "image";     // 画像のID
    var IMAGE_WIDTH = "400px";  // 画像の幅
    var IMAGE_HEIGHT = "300px"; // 画像の高さ
    var ANSIMAGE_WIDTH = "100px";       // 答あわせ画像の幅
    var ANSIMAGE_HEIGHT = "75px";       // 答あわせ画像の高さ
    var WHOLE_PRACTICE = "whole_practice";
    var WHOLE_EXPERIMENT = "whole_experiment";
    var PARTIAL_PRACTICE = "partial_practice";
    var PARTIAL_EXPERIMENT = "partial_experiment";

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = ["beep0", "beep1", "beep2", "beep3"];
    // この実験ではIMAGESがblocksに依存するのでblocksの後で設定する

    // ***** ブロック・試行・刺激の定義
    var make_trials = function (block, src) {
        var array = [], trial;

        src.forEach(function (index, i) {
            var imgname = "" + block + "-" + i;
            var ansprefix = ((index === -1) ? "" : "ans");

            trial = {
                number: i,              // 試行番号
                index: index,           // 音(行)番号(partialのみ,wholeは-1)
                imgname: imgname,       // 刺激画像名
                ansprefix: ansprefix    // 答合わせ用画像名の先頭につく文字列
            };
            array.push(trial);
        });
        return array;
    };

    var blocks = [
        { name: "全体報告の練習",
          type: WHOLE_PRACTICE,
          trials: make_trials(0, [-1].repeat(5)) },
        { name: "全体報告の本試行",
          type: WHOLE_EXPERIMENT,
          trials: make_trials(1, [-1].repeat(10)) },
        { name: "部分報告の練習",
          type: PARTIAL_PRACTICE,
          trials: make_trials(2, [0, 2, 1, 1, 2, 0, 2, 0, 1]) },
        { name: "部分報告の本試行",
          type: PARTIAL_EXPERIMENT,
          trials: make_trials(3, [0, 2, 1, 1, 2, 1, 2, 0, 1, 0,
                                  2, 1, 2, 0, 2, 1, 0, 0, 2, 0,
                                  2, 0, 2, 1, 1, 0, 2, 1, 0, 0]) }
    ];

    var IMAGES = function () {
        var DIR = "img/", ANSDIR = "ansimg/", EXT = ".png";
        var src = [["fix", "img/fix.png"], ["blank", "img/blank.png"]];

        blocks.forEach(function (block) {
            block.trials.forEach(function (trial) {
                // 刺激画像
                src.push([trial.imgname, DIR + trial.imgname + EXT]);
                // 部分報告の場合は答合わせ用画像も読み込む
                if (trial.ansprefix !== "") {
                    src.push([trial.ansprefix + trial.imgname,
                              ANSDIR + trial.imgname + EXT]);
                }
            });
        });
        return src;
    }();


    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
        b = 0;
        IO.clear(ID_MAIN);
        IO.display_instruction("【Sperlingの実験】", [], ID_MAIN);
        block_prologue();
    };

    var play_sample = function () {
        AUDIOS["beep3"].play();
    };

    // ***** ブロックごとの開始時に実施する処理
    // ブロックごとの教示・試行実施順の決定など
    // do_first_trialを呼ぶこと
    var block_prologue = function () {
        block = blocks[b];
        block.trials.shuffle();
        t = 0;
        var msg;

        IO.set_element_style(ID_MAIN, { textAlign: "left" });
        if (block.type === WHOLE_PRACTICE) {
            IO.append_paragraph("全体報告課題を始めます。まず画面中央に+が呈示されますので、注視していてください。それが消えた2秒後に12個のひらがなが瞬間的に呈示されます。文字が消えたらすぐに、呈示された文字を記入用紙にできるだけたくさん書いてください。書き終えたらスペースキーを押して次に進んでください。", ID_MAIN);
        } else if (block.type === PARTIAL_PRACTICE) {
            IO.append_paragraph("部分報告課題を始めます。まず最初に画面中央に+が呈示されますので、注視していてください。それが消えた2秒後に12個のひらがなが瞬間的に呈示されます。文字が消えたあと「高い音」が鳴ったら上の行、「中くらいの音」が鳴ったら真ん中の行、「低い音」が鳴ったら下の行の文字を、すぐにできるだけたくさん記入用紙に書いてください。書き終えたらスペースキーを押して次に進んでください。", ID_MAIN);
            IO.set_html("<p>まずはじめに下のボタンをクリックして高・中・低の音を確認してください。</p><p><button type='button' id='play_sample'>音の確認</button></p>", 
                        IO.append_element("div", null, "center", ID_MAIN));
            document.getElementById("play_sample").onclick = play_sample;
        }
        IO.append_paragraph("スペースキーを押すと" + block.name + "を開始します。" +
                            "全部で" + block.trials.length + "問あります。",
                            ID_MAIN, "center");
        IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
    };
    
    // ***** ブロック最初の試行に先立って実施する処理
    // 表示領域の準備など
    // do_trialを呼ぶこと
    var do_first_trial = function () {
        IO.clear(ID_MAIN);
        IO.set_element_style(ID_MAIN, { backgroundColor: WHITE });
        IO.append_element('img', ID_IMAGE,
                          { width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
                          ID_MAIN, "center");
        setTimeout(do_trial, T_ITI);
    };

    // ***** 1試行の実施
    // next_trial()を呼ぶこと
    var do_trial = function () {
        trial = block.trials[t];
        if (block.type.match(/^partial/)) {
            IO.present_stimuli_and_wait_for_key(
                [[IMAGES.fix, T_FIX, ID_IMAGE],
                 [IMAGES.blank, T_BLANK, ID_IMAGE],
                 [IMAGES[trial.imgname], T_PRESENT, ID_IMAGE],
                 [IMAGES.blank, 0, ID_IMAGE],
                 [AUDIOS["beep" + trial.index], -1]
                ],
                IO.KEYCODE.SPACE,
                set_reaction);
        } else {
            IO.present_stimuli_and_wait_for_key(
                [[IMAGES.fix, T_FIX, ID_IMAGE],
                 [IMAGES.blank, T_BLANK, ID_IMAGE],
                 [IMAGES[trial.imgname], T_PRESENT, ID_IMAGE],
                 [IMAGES.blank, -1, ID_IMAGE]
                ],
                IO.KEYCODE.SPACE,
                set_reaction);
        }
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶ
    var set_reaction = function (keycode, rt) {
        next_trial();
    };

    // ***** 次の試行に進む処理
    // ブロックが終わりならblock_epilogue、そうでなければdo_trialを呼ぶ
    var next_trial = function () {
        IO.clear(ID_IMAGE);
        t = t + 1;
        if (t >= block.trials.length) {
            t = 0;
            b = b + 1;
            setTimeout(block_epilogue, T_ITI);
        } else {
            setTimeout(do_trial, T_ITI);
        }
    };

    // ***** ブロック終了時に実施する処理
    // 実験が終わりならblock_prologue、そうでなければepilogueを呼ぶ
    // この関数が呼ばれた時点でbとtは既に進められているので注意
    // (blockは更新されていない)
    var block_epilogue = function () {
        var str = "<center><table><tr>";

        IO.clear(ID_MAIN);
        block.trials.forEach(function (trial, i) {
            str += "<td align='right'>";
            str += (i + 1) < 10 ? "&nbsp;" + (i + 1) : (i + 1);
            str += "<img id='t" + i + "' width='" + ANSIMAGE_WIDTH + 
                "' height='" + ANSIMAGE_HEIGHT + "' align='top'></td>";
            if (i % 7 === 6 && i !== block.trials.length - 1) {
                str += "</tr><tr>";
            }
        });
        str += "</tr></table><p>答合わせが終わったらスペースキーを押してください。</p></center>";
        IO.set_html(str, ID_MAIN);
        block.trials.forEach(function (trial, i) {
            IO.set_image(IMAGES[trial.ansprefix + trial.imgname], "t" + i);
        });
        IO.wait_for_key(IO.KEYCODE.SPACE, block_epilogue2);
    };

    var block_epilogue2 = function () {
        IO.clear(ID_MAIN);
        IO.set_element_style(ID_MAIN, { backgroundColor: CYAN, textAlign: "center" } );
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

        string += "<h3>【Sperlingの実験結果報告】</h3>";
        string += "<form>";
        string += "<p>全体報告平均：<input type='text' id='whole' size='20'></p>";
        string += "<p>部分報告平均：<input type='text' id='partial' size='20'></p>";
        string += "<input type='button' id='button' value='報告'></form></center>";
        IO.set_html(string, IO.append_element("div", null, "center", ID_MAIN));
        document.getElementById('button').onclick = epilogue2;
    }

    var epilogue2 = function () {
        var string = "";
        end_time = new Date();
        if (typeof SAVE_STYLE === 'undefined' || SAVE_STYLE !== 'verbose') {
            string += [id, sex,
                       document.getElementById('whole').value,
                       document.getElementById('partial').value].join(DELIMITER) + "\n";
            IO.save_data(TITLE, "", string, ID_MAIN, 'append');
        } else {
            string += "### " + TITLE + "\n";
            string += "### id = " + id + " sex = " + sex + "\n";
            string += "### start: " + start_time + "\n";
            string += [document.getElementById('whole').value,
                       document.getElementById('partial').value].join(DELIMITER) + "\n";
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
