// levels_of_processing
//
// 処理水準

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "levels_of_processing"; // 結果データを保存するディレクトリ名に使われる
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
    var T_BLANK = 1000; // 空白の呈示時間(ms)
    var T_WORD = 3000;  // 刺激呈示時間(ms)
    var T_FIX = 300;            // 注視点呈示時間(ms)
    var T_PRE = 500;            // 注視点と再認単語のISI(ms)
    var T_ITI = 1000;           // 試行間間隔(ms)
    var ID_MAIN = "main";       // 表示領域のID
    var MAIN_WIDTH = "800px";   // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";       // 表示領域の背景色
    var WHITE = "#FFFFFF";      // 表示領域の背景色
    var ID_CENTER = "center";           // 質問文呈示領域のID
    var CENTER_WIDTH = "800px";         // 質問文呈示領域の幅
    var CENTER_HEIGHT = "32px";         // 質問文呈示領域の高さ
    var CENTER_FONTSIZE = "32px";       // 質問文呈示領域のフォントサイズ
    var CENTER_HEIGHT_TEST = "48px";    // 質問文呈示領域の高さ
    var CENTER_FONTSIZE_TEST = "48px";  // 質問文呈示領域のフォントサイズ
    var ID_BOTTOM = "bottom";           // 単語呈示領域のID
    var BOTTOM_WIDTH = "800px";         // 単語呈示領域の幅
    var BOTTOM_HEIGHT = "48px";         // 単語呈示領域の高さ
    var BOTTOM_FONTSIZE = "48px";       // 単語呈示領域のフォントサイズ
    var BOTTOM_X = 40;                  // 単語呈示領域のX位置
    var BOTTOM_Y = 300;                 // 単語呈示領域のY位置
    var KEY_YES = IO.KEYCODE.J;
    var KEY_NO = IO.KEYCODE.F;
    var PHYSICAL = 'phy';
    var PHONETIC = 'pho';
    var SEMANTIC = 'sem';
    var TARGET = 'target';
    var DISTRACTER = 'distracter';
    var DUMMY = 'dummy';
    var T = 'T';
    var F = 'F';
    var HIT = "Hit";
    var MISS = "Miss";
    var FALSE_ALARM = "FA";
    var CORRECT_REJECTION = "CR";
    var CORRECT = "Correct";
    var ERROR = "Error";
    var TIMEOUT = "Timeout";
    var LEARNING_PRACTICE = "learning_practice";
    var LEARNING = "learning";
    var TEST = "test";
    var CHIME = "chime";
    var BOO = "boo";

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = [CHIME, BOO];
    var IMAGES = null;

    // ***** ブロック・試行・刺激の定義
    var make_learning_trials = function (src) {
        var array = [];

        // srcは [[PHYSICAL, T, ["ひらがなですか", "きんぎょ"]], ...]
        src.forEach(function (s, i) {
            array.push({ n: i,
                         processing: s[0], qtype: s[1],
                         question: s[2][0], word: s[2][1],
                         answer: null, result: null, rt: null
                       });
        });
        return array;
    };

    var make_test_trials = function (src) {
        var array = [];

        // srcは [ [TARGET, PHYSICAL, T, "あかり"], ... ]
        src.forEach(function (s, i) {
            array.push({ n: i,
                         type: s[0], processing: s[1], qtype: s[2], word: s[3], 
                         answer: null, result: null, rt: null });
        });
        return array;
    };

    var blocks = [
        { name: "練習",
          type: "learning_practice",
          trials: make_learning_trials(
              [
                  [ PHYSICAL, T, [["ひらがなですか", "きんぎょ"]] ].combine(),
                  [ PHYSICAL, F, [["漢字ですか", "ことば"]] ].combine(),
                  [ PHONETIC, T, [["「は」という音で始まりますか", "花火"]] ].combine(),
                  [ PHONETIC, F, [["「み」という音で始まりますか", "陶器"]] ].combine(),
                  [ SEMANTIC, T, [["楽器の名前ですか", "太鼓"]] ].combine(),
                  [ SEMANTIC, F, [["乗物の名前ですか", "ゆうびん"]] ].combine()
              ].flatten1()
          ) },
        { name: "本試行",
          type: "learning",
          trials: make_learning_trials(
              [
                  [ PHYSICAL, T, [["ひらがなですか", "あかり"],
                                  ["ひらがなですか", "こうもり"],
                                  ["漢字ですか", "本棚"],
                                  ["漢字ですか", "書類"],
                                  ["漢字ですか", "彫像"]] ].combine(),
                  [ PHYSICAL, F, [["ひらがなですか","廊下"],
                                  ["ひらがなですか","新緑"],
                                  ["ひらがなですか","建物"],
                                  ["漢字ですか","あかつき"],
                                  ["漢字ですか","とうき"]] ].combine(),
                  [ PHONETIC, T, [["「け」という音で始まりますか", "けいさん"],
                                  ["「げ」という音で始まりますか", "げんかん"],
                                  ["「さ」という音で始まりますか", "参拝"],
                                  ["「と」という音で始まりますか", "燈台"],
                                  ["「お」という音で始まりますか", "音楽"]] ].combine(),
                  [ PHONETIC, F, [["「ら」という音で始まりますか", "かいだん"],
                                  ["「ろ」という音で始まりますか", "しんせつ"],
                                  ["「く」という音で始まりますか", "しかい"],
                                  ["「と」という音で始まりますか", "看板"],
                                  ["「は」という音で始まりますか", "万年筆"]] ].combine(),
                  [ SEMANTIC, T, [["動物の名前ですか", "くま"],
                                  ["野菜の名前ですか", "にんじん"],
                                  ["病気の名前ですか", "はしか"],
                                  ["昆虫の名前ですか", "蝶々"],
                                  ["家具の名前ですか", "机"]] ].combine(),
                  [ SEMANTIC, F, [["時間の単位ですか", "ははおや"],
                                  ["ゲームの名前ですか", "かびん"],
                                  ["果物の名前ですか", "名刺"],
                                  ["建物の名前ですか", "山脈"],
                                  ["国の名前ですか", "靴"]] ].combine()
              ].flatten1()
          ) },
        { name: "再認",
          type: TEST,
          trials: make_test_trials(
              [
                  [ TARGET, PHYSICAL, T, 
                    ["あかり", "こうもり", "本棚", "書類", "彫像"] ].combine(),
                  [ TARGET, PHONETIC, T,
                    ["けいさん", "げんかん", "参拝", "燈台", "音楽"] ].combine(),
                  [ TARGET, SEMANTIC, T,
                    ["くま", "にんじん", "はしか", "蝶々", "机"] ].combine(),
                  [ TARGET, PHYSICAL, F,
                    ["廊下", "新緑", "建物", "あかつき", "とうき"] ].combine(),
                  [ TARGET, PHONETIC, F,
                    ["かいだん", "しんせつ", "しかい", "看板", "万年筆"] ].combine(),
                  [ TARGET, SEMANTIC, F,
                    ["ははおや", "かびん", "名刺", "山脈", "靴"] ].combine(),
                  [ DISTRACTER, DUMMY, DUMMY,
                    ["めがね", "ふとん", "船", "子供", "夕刊", 
                     "けしょう", "げんご", "さくら", "時計", "おもちゃ",
                     "猫", "きゅうり", "ねんざ", "せみ", "椅子",
                     "ちりがみ", "かばん","ちゃわん", "標識", "電話", 
                     "やおや", "靴下", "信号", "鉄道", "新聞",
                     "歩道", "まくら", "自動車", "電柱", "上着"] ].combine()
              ].flatten1()
          ) }
        ];

    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
        var setup = function () {
            b = 0;
        };

        setup();
        IO.clear(ID_MAIN);
        IO.display_instruction("【Levels of Processing実験】",
                               [["画面中央に単語と問題が１組ずつ呈示されていきます。答えがYesならば右手の人差し指で【J】のキーを，Noならば左手の人差し指で【F】のキーを，できるだけ早く押してください。すると次の単語と問題に進みます。", "left"]],
                               ID_MAIN);
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
        if (block.type === LEARNING_PRACTICE || block.type === LEARNING) {
            IO.append_paragraph("スペースキーを押すと" + block.name + "を開始します。" +
                                "全部で" + block.trials.length + "試行あります。",
                                ID_MAIN,
                               "center");
        } else {
            IO.clear(ID_MAIN);
            IO.display_instruction("",
                                   [["画面中央に単語が1つずつ呈示されます。さきほど呈示された中にあった単語の場合は右手の人差し指で【J】のキーを，なかった単語の場合左手の人差し指で【F】のキーを押してください。すると次の単語が呈示されます。", "left"],
                                    ["スペースキーを押すと開始します。全部で" +
                                     block.trials.length + "試行あります。",
                                     "center"]],
                                   ID_MAIN);
        }
        IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
    };

    // ***** ブロック最初の試行に先立って実施する処理
    // 表示領域の準備など
    // do_trialを呼ぶこと
    var do_first_trial = function () {
        var set_screen = function () {
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, { backgroundColor: WHITE });
            IO.append_element('div', ID_CENTER,
                              { width: CENTER_WIDTH, 
                                height: (block.type === TEST ?
                                         CENTER_HEIGHT_TEST : CENTER_HEIGHT),
                                textAlign: "center",
                                fontSize: (block.type === TEST ?
                                           CENTER_FONTSIZE_TEST : CENTER_FONTSIZE)
                              },
                              ID_MAIN, "center");
            IO.append_element('div', ID_BOTTOM,
                              { width: BOTTOM_WIDTH, height: BOTTOM_HEIGHT,
                                textAlign: "center", fontSize: BOTTOM_FONTSIZE},
                              ID_MAIN, BOTTOM_X, BOTTOM_Y);
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
        if (block.type === LEARNING_PRACTICE || block.type === LEARNING) {
            IO.present_stimuli_and_wait_for_key(
                [["＊＊", T_FIX, ID_CENTER],
                 ["", T_PRE, ID_CENTER],
                 ["次の単語は" + trial.question, 0, ID_CENTER],
                 [trial.word, T_WORD, ID_BOTTOM, false]],
                [KEY_YES, KEY_NO],
                set_result,
                function (keycode) {
                    if (keycode === KEY_YES) {
                        AUDIOS[(trial.qtype === T) ? CHIME: BOO].play();
                    } else if (keycode === KEY_NO) {
                        AUDIOS[(trial.qtype === F) ? CHIME: BOO].play();
                    }
                 }
            );
        } else {
            IO.present_stimuli_and_wait_for_key(
                [["＊＊", T_FIX, ID_CENTER],
                 ["", T_PRE, ID_CENTER],
                 [trial.word, -1, ID_CENTER]],
                [KEY_YES, KEY_NO],
                set_result);
        }
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶこと
    var set_result = function (keycode, rt) {
        if (block.type === LEARNING_PRACTICE || block.type === LEARNING) {
            if (keycode === KEY_YES) {
                trial.answer = "yes";
                trial.result = (trial.qtype === T) ? CORRECT : ERROR;
            } else if (keycode === KEY_NO) {
                trial.answer = "no";
                trial.result = (trial.qtype === T) ? ERROR : CORRECT;
            } else if (keycode === IO.KEYCODE.TIMEOUT) {
                trial.answer = "timeout";
                trial.result = TIMEOUT;
            }
        } else {
            if (keycode === KEY_YES) {
                trial.answer = "yes";
                if (trial.type === TARGET) {
                    trial.result = HIT;
                    AUDIOS[CHIME].play();
                } else {
                    trial.result = FALSE_ALARM;
                    AUDIOS[BOO].play();
                }
            } else if (keycode === KEY_NO) {
                trial.answer = "no";
                if (trial.type === TARGET) {
                    trial.result = MISS;
                    AUDIOS[BOO].play();
                } else {
                    trial.result = CORRECT_REJECTION;
                    AUDIOS[CHIME].play();
                }
            }
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
                IO.setTimeout(do_trial, T_ITI);
            }
        };

        IO.clear(ID_CENTER);
        IO.clear(ID_BOTTOM);
        advance();
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
        var score = 0, n = 0, mean_rt = 0;

        set_screen();
        if (block.type.match(/practice$/)) {
            block.trials.forEach(function (trial) {
                if (trial.result === CORRECT) {
                    score += 1;
                }
                if (trial.result !== TIMEOUT) {
                    mean_rt += trial.rt;
                    n += 1;
                }
            });
            score = Math.floor(score / block.trials.length * 100);
            if (n === 0) {
                IO.append_paragraph("正答率は" + score + "%でした。", ID_MAIN, "center");
            } else {
                mean_rt = Math.floor(mean_rt / n);
                IO.append_paragraph("正答率は" + score + "% " + "平均反応時間は" + mean_rt + "msでした。", ID_MAIN, "center");
            }
            IO.append_paragraph("できるだけ早く、かつ、間違えないように反応してください。", ID_MAIN, "center");
        }
        advance();
    };

    // ***** 全ブロック終了時に1回だけ実施する処理
    // データ保存など
    var epilogue = function () {
        var string = "", array;

        end_time = new Date();
        if (typeof SAVE_STYLE === 'undefined' || SAVE_STYLE !== 'verbose') {
            array = [];
            blocks.forEach(function (block) {
                if (block.type !== TEST) { return; }
                block.trials.forEach(function (trial) {
                    if (trial.type === TARGET) {
                        if (array[trial.n] === undefined) {
                            array[trial.n] = 0;
                        }
                        if (trial.result === HIT) {
                            array[trial.n] += 1;
                        }
                    }
                });
            });
            string += [id, sex].join(DELIMITER);
            array.forEach(function (trial_result) {
                string += DELIMITER + trial_result;
            });
            string += "\n";
            IO.save_data(TITLE, "", string, ID_MAIN, 'append');
        } else {
            string += "### " + TITLE + "\n";
            string += "### id = " + id + " sex = " + sex + "\n";
            string += "### start: " + start_time + "\n";
            blocks.forEach(function (block) {
                block.trials.forEach(function (trial) {
                    string += result_string(block, trials);
                });
            });
            string += "### end  : " + end_time + "\n";
            IO.save_data(TITLE, id, string, ID_MAIN);
        }
    };

    // ***** blockとtrialから結果記録用文字列を1試行分作成する
    var result_string = function (block, trial) {
        if (block.type === LEARNING_PRACTICE || block.type === LEARNING) {
            return [block.name, trial.n,
                    trial.processing, trial.qtype,
                    trial.question, trial.word,
                    trial.answer, trial.result, trial.rt].join(DELIMITER) + "\n";
        } else {
            return [block.name, trial.n,
                    trial.processing, trial.qtype, trial.type,
                    trial.word,
                    trial.answer, trial.result, trial.rt].join(DELIMITER) + "\n";
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
