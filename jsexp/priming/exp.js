// priming
//
// プライミング

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "priming";      // 結果データを保存するディレクトリ名に使われる
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
    var T_BLANK = 1000;         // 注視点からプライムまでのISI(ms)
    var T_PRIME = 50;           // プライム呈示時間(ms)
    var T_ITI = 1000;           // 試行間間隔(ms)
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
    var YES = "Yes"
    var NO = "No"
    var WORD = "word";
    var NONWORD = "nonword";
    var HIGH = "H";
    var LOW = "L";
    var NONE = "N";
    var DUMMY = "D";
    var RELEVANCES = [ HIGH, LOW, NONE, DUMMY ];
    var CORRECT = "Correct";
    var ERROR = "Error";
    var OPTION = { group: ["グループ",
                             [{ name: "Group 1", value: 0 },
                              { name: "Group 2", value: 1 },
                              { name: "Group 3", value: 2 }]] };

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = ["chime", "boo"];

    // ***** ブロック・試行・刺激の定義
    var make_trials = function (prime, target) {
        var array = [], n = {}, relevance;
        var increment = function (x) {
            if (x === undefined) { return 0; }
            else { return x + 1; }
        };

        if (prime.length !== target.length) { alert("試行の定義に異常があります。"); }

        // primeは  [ [WORD, HIGH, "封書"], ... ]
        // targetは [ [WORD, "手紙"], ... ]
        prime.forEach(function (p, i) {
            if (p[0] !== target[i][0]) { alert("試行の定義に異常があります。"); }
            relevance = p[1];
            n[relevance] = increment(n[relevance]);
            array.push( {type: p[0],
                         relevance: relevance,
                         n : n[relevance],
                         prime: p[2],
                         target: target[i][1],
                         soa: (Math.floor(i / 3) % 4 + 1) * 100,
                         answer: null, result: null, rt: null } );
        });
        return array;
    };

    var PRACTICE_PRIME = [
        [[WORD, HIGH, "封書"],
         [WORD, LOW,  "自由"],
         [WORD, NONE, "視線"]],
        [NONWORD, DUMMY, ["理屈", "日本", "自信"]].combine()
    ].flatten1();
    var PRACTICE_TARGET = [
        [WORD, ["手紙", "権利", "陶器"]].combine(),
        [NONWORD, ["取事", "拒能", "得不"]].combine()
    ].flatten1();

    var PRIME = [
        [[WORD, HIGH, ["仕事","歴史","黒字","会話","高騰","調査",
                       "銀行","介護","警察","名前","戦争","子供"]].combine(),
         [WORD, LOW,  ["平和","田舎","討論","生徒","関係","人間",
                       "地獄","公害","物価","教授","健康","社会"]].combine(),
         [WORD, NONE, ["税金","地下","書道","説明","悲劇","自己",
                       "交通","無色","睡眠","動画","建築","短歌"]].combine(),
         [NONWORD, DUMMY, ["利益","加速","掃除","倉庫","被害","知人",
                           "小売","利用","指導","比較","用意","配置",
                           "余裕","名誉","整理","批判","区域","様子",
                           "合意","繊維","基盤","自動","舞台","区間",
                           "程度","通知","貨物","範囲","幹事","進歩",
                           "期待","委員","多数","模様","意識","募金"]].combine()
        ].flatten1(),
        [[WORD, LOW,  ["努力","平成","予算","友達","資源","社会",
                       "残高","施設","犯罪","紹介","災害","幼児"]].combine(),
         [WORD, NONE, ["別居","努力","体温","予定","読解","暗号",
                       "四角","商店","電子","天気","教室","太陽"]].combine(),
         [WORD, HIGH, ["米国","過去","仕事","時計","酸素","理科",
                       "芸術","漢字","携帯","病院","裁判","工場"]].combine(),
         [NONWORD, DUMMY, ["利益","加速","掃除","倉庫","被害","知人",
                           "小売","利用","指導","比較","用意","配置",
                           "余裕","名誉","整理","批判","区域","様子",
                           "合意","繊維","基盤","自動","舞台","区間",
                           "程度","通知","貨物","範囲","幹事","進歩",
                           "期待","委員","多数","模様","意識","募金"]].combine()
        ].flatten1(),
        [[WORD, NONE, ["文化","手段","回路","冒険","担任","保存",
                       "冒険","茶色","発達","貿易","哲学","部品"]].combine(),
         [WORD, HIGH, ["地球","東京","会社","名前","家族","会話",
                       "天使","環境","値段","授業","公園","主義"]].combine(),
         [WORD, LOW,  ["勉強","予想","時間","約束","汚染","進歩",
                       "鑑賞","言葉","会話","医療","法律","自動"]].combine(),
         [NONWORD, DUMMY, ["利益","加速","掃除","倉庫","被害","知人",
                           "小売","利用","指導","比較","用意","配置",
                           "余裕","名誉","整理","批判","区域","様子",
                           "合意","繊維","基盤","自動","舞台","区間",
                           "程度","通知","貨物","範囲","幹事","進歩",
                           "期待","委員","多数","模様","意識","募金"]].combine()
        ].flatten1()
    ];
    var TARGET = [
        [WORD, ["苦労","時代","赤字","話題","石油","世論",
                "預金","福祉","指紋","名刺","犠牲","育児",
                "世界","都会","会議","名簿","親子","対話",
                "悪魔","汚染","価格","講義","散歩","資本",
                "英語","未来","勤務","時間","空気","科学",
                "絵画","国語","電話","看護","弁護","機械"]].combine(),
        [NONWORD, ["談位","身得","逮防","津最","幹訴","税復",
                   "果平","階全","程改","退績","徒今","基元",
                   "禁攻","消首","展投","能進","期報","責続",
                   "正契","録開","離作","被際","催府","折候",
                   "台構","認不","解断","閣腹","整批","策止",
                   "明者","違採","審当","館針","般案","確摘"]].combine()
    ].flatten1();

    var blocks = [
        { name: "練習",
          type: "practice",
          timeout: 0,
          trials: make_trials(PRACTICE_PRIME, PRACTICE_TARGET)},
        { name: "本試行",
          type: "experiment",
          timeout: 0,
          trials: null // グループに依存するのでprologueで作る
        } ];

    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
        var sub = function () {
            blocks[1].trials = make_trials(PRIME[OPTION.group.value], TARGET);
            b = 0;
            IO.clear(ID_MAIN);
            IO.display_instruction("【Priming実験】",
                                   ["画面に＊＊が呈示されたあと，2つの語が少し間隔をあけて同じ箇所に連続して呈示されます。2つ目の語が実在する単語の場合は右手の人差し指で【J】のキーを，実在しない非単語の場合は左手の人差し指で【F】のキーを，できるだけ早く正確に押してください。しばらくすると，次の試行が呈示されます。"], 
                                   ID_MAIN);
            block_prologue();
        };
        IO.select_option("グループを選んでください", ID_MAIN, OPTION, sub);
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
                            ID_MAIN, { textAlign: "center" });
        IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
    };

    // ***** ブロック最初の試行に先立って実施する処理
    // 表示領域の準備など
    // do_trialを呼ぶこと
    var do_first_trial = function () {
        IO.clear(ID_MAIN);
        IO.set_element_style(ID_MAIN, { backgroundColor: WHITE });
        IO.append_element("div", ID_CENTER,
                          { width: CENTER_WIDTH, height: CENTER_HEIGHT,
                            textAlign: "center", fontSize: CENTER_FONTSIZE},
                          ID_MAIN, "center");
        IO.setTimeout(do_trial, T_ITI);
    };

    // ***** 1試行の実施
    // next_trialを呼ぶこと
    var do_trial = function () {
        var timeout = 0;
        trial = block.trials[t];
        IO.present_stimuli_and_wait_for_key(
            [["＊＊", T_FIX, ID_CENTER],
             ["", T_BLANK, ID_CENTER],
             [trial.prime, T_PRIME, ID_CENTER],
             ["", trial.soa - T_PRIME, ID_CENTER],
             [trial.target, -1, ID_CENTER]],
            [KEY_YES, KEY_NO],
            set_reaction);
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶ
    var set_reaction = function (keycode, rt) {
        trial.rt = rt;
        if (keycode === KEY_YES) {
            trial.answer = YES;
            trial.result = (trial.type === WORD) ? CORRECT : ERROR;
        } else if (keycode === KEY_NO) {
            trial.answer = NO;
            trial.result = (trial.type === WORD) ? ERROR : CORRECT;
        }
        next_trial();
    };

    // ***** 次の試行に進む処理
    // ブロックが終わりならblock_epilogue、そうでなければdo_trialを呼ぶ
    var next_trial = function () {
        var advance = function () {
            t = t + 1;
            if (t >= block.trials.length) {
                t = 0; b = b + 1; IO.setTimeout(block_epilogue, T_ITI);
            } else { IO.setTimeout(do_trial, T_ITI); }
        };

        IO.clear(ID_CENTER);
        if (trial.result === CORRECT) {
            AUDIOS["chime"].play();
        } else {
            AUDIOS["boo"].play();
        }
        advance();
    };

    // ***** ブロック終了時に実施する処理
    // 実験が終わりならblock_prologue、そうでなければepilogueを呼ぶ
    // この関数が呼ばれた時点でbとtは既に進められているので注意
    // (blockとtrialは更新されていない)
    var block_epilogue = function () {
        var score = 0, mean_rt = 0;
        var set_screen = function () {
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, {backgroundColor: CYAN, textAlign: "center"});
        };
        var advance = function () {
            if (b < blocks.length) { block_prologue();} else { epilogue(); }
        };

        set_screen();
        if (block.type.match(/practice$/)) {
            block.trials.forEach(function (trial) {
                if (trial.result === CORRECT) {
                    score += 1;
                    mean_rt += trial.rt;
                }
            });
            mean_rt = Math.floor(mean_rt / score);
            score = Math.floor(score / block.trials.length * 100);
            IO.append_paragraph("正答率は" + score + "% " + "平均反応時間は" + mean_rt + "msでした。できるだけ早く、かつ、間違えないように反応してください。", ID_MAIN);
        }
        advance();
    };

    // ***** 全ブロック終了時に1回だけ実施する処理
    // データ保存など
    var epilogue = function () {
        var string = "", sum, rt;

        end_time = new Date();
        if (typeof SAVE_STYLE === 'undefined' || SAVE_STYLE !== 'verbose') {
            blocks.forEach(function (block) {
                if (block.type !== 'experiment') { return; }
                // 正答数を数えながら反応時間をrtというオブジェクトにコピーする
                // rt[HIGH][0]は関連性高の最初(実施順ではなく定義順)の刺激を意味する
                sum = 0;
                rt = {};
                block.trials.forEach(function (trial) {
                    rt.init_property(trial.relevance, []);
                    if (trial.result === CORRECT) {
                        sum += 1;
                        rt[trial.relevance][trial.n] = trial.rt;
                    } else {
                        rt[trial.relevance][trial.n] = "";
                    }
                });
                // 出力文字列作成
                string += [id, sex, sum].join(DELIMITER);
                RELEVANCES.forEach(function (rel) {
                    rt[rel].forEach(function (r) {
                        string += DELIMITER + r;
                    });
                });
                string += "\n";
            });
            IO.save_data(TITLE, "", string, ID_MAIN, 'append');
        } else {
            string += "### " + TITLE + "\n";
            string += "### id = " + id + " sex = " + sex + "\n";
            string += "### group = " + OPTION.group.name + "\n";
            string += "### start: " + start_time + "\n";
            blocks.forEach(function (block) {
                block.trials.forEach(function (trial) {
                    string += [block.name,
                               trial.type, trial.relevance, trial.n, 
                               trial.soa,
                               trial.prime, trial.target, 
                               trial.answer, trial.result,
                               trial.rt].join(DELIMITER) + "\n";
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
