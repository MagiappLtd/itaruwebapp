// JavaScript心理学実験
// 共通コード

var DEBUG = false;

var IO = (function () {
    // ********** ここを必要に応じて変更
    var SAVE_MODE = "local";                    // networkまたはlocal
    var SAVER_URL = "../cgi-bin/jsexpsave.cgi"; // データ保存cgiのURL
    var SAVER_TIMEOUT = 5000;                   // データ保存cgi呼出時タイムアウト(ms)
    var DEFAULT_SAVE_FILE_NAME = "result";      // フォルダもファイルも無指定時の名前
    var SAVE_FILE_NAME_EXT = "txt";             // 保存ファイル名の拡張子
    var IMAGE_DIR = "../IMAGE";                 // 画像のあるディレクトリ
    var IMAGE_EXT = "png";                      // 画像の拡張子
    var AUDIO_DIR = "../AUDIO";                 // 音声のあるディレクトリ
    var AUDIO_EXTS = ["ogg", "mp3", "wav"];     // 音声の拡張子(優先順にリスト)
    var USE_FULLSCREEN_API = false;             // 全画面APIを使用するならtrue
    // ********** ここまでを必要に応じて変更

    // デバッグモードでの待ち時間
    var T_DEBUG = 10;
    // デバッグモードでの参加者id
    var ID_DEBUG = "99999";
    // デバッグモードでのダミー反応時間
    var RT_DEBUG = function () { return make_random_number(350, 650); };

    var TYPE_STRING = "[object String]";
    var TYPE_NUMBER = "[object Number]";
    var TYPE_ARRAY  = "[object Array]";
    var TYPE_OBJECT = "[object Object]";
    var TYPE_IMAGE  = "[object HTMLImageElement]";
    var TYPE_AUDIO  = "[object HTMLAudioElement]";
    var TYPE_FUNCTION = "[object Function]";

    var IMAGE = 1;
    var AUDIO = 2;

    // 10*10の透明色のpngデータ
    var BLANK_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKAQMAAAC3/F3+AAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAAtJREFUCJljYMAHAAAeAAHu9nAhAAAAAElFTkSuQmCC";

    var UA = window.navigator.userAgent.toLowerCase();
    var KEYCODE = {
        TIMEOUT: -1,
        ZERO: 48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52,
        FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
        A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74,
        K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84,
        U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
        MINUS: 189, CIRCUMFLEX: 222, 
        COMMA: 188, PERIOD: 190, SLASH: 191, BACKSLASH: 226,
        SEMICOLON: 187, COLON: 186,
        ESCAPE: 27, SPACE: 32, ENTER: 13,
        LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40
    };
    if (UA.indexOf('opera') != -1) {
        KEYCODE.SLASH = 47;
        KEYCODE.MINUS = 109;
        KEYCODE.CIRCUMFLEX = 94;
        KEYCODE.BACKSLASH = 220;
        KEYCODE.SEMICOLON = 59;
        KEYCODE.COLON = 59;
    } else if (UA.indexOf('firefox') != -1) {
        KEYCODE.SEMICOLON = 61;
        KEYCODE.COLON = 59;
        KEYCODE.MINUS = 109;
    };

    var _time0;
    var _waiting_for_key = false;
    var _valid_keys;
    var _callback_function;
    var _keycheck_function;
    var _keyCode;
    var _rt;
    var _callback_on_key = true;
    var _options;
    var _timeout_id = null;

    var make_sequence = function (from, to) {
        var array = [], i;
        for (i = from ; i <= to; i++) {
            array.push(i);
        }
        return array;
    };

    var make_random_number = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    var keyCode = function (e) {
        if (e == null) {
            return event.keyCode;
        } else if (document.all) {
            return e.keyCode;
        } else if (document.getElementById) {
            return (e.keyCode) ? e.keyCode : e.charCode;
        } else if (document.layers) {
            return e.which;
        }
        return undefined;
    };

    // ***** 基本情報の入力
    // IO.input_basic_data(id, callback_function)
    //    id: 表示する領域のid
    //    callback_function: 入力完了後に呼ばれる関数
    var input_basic_data = function (parent, callback_function) {
        var FORM =
            ["<p textAlign='center'><form name='_basic_data_form'>",
             "<p>参加者番号: <input type='text' name='sname' size='10'></p>",
             "<p>性別: <input type='radio' name='sex' value='female'> 女性 ",
             "<input type='radio' name='sex' value='male'> 男性</p>",
             "<p><input type='button' value='決定' name='start'></p>",
             "</form></p>"].join('');
        var element;

        parent = get_element(parent);
        if (DEBUG) {
            callback_function(ID_DEBUG, ["male", "female"].select_randomly());
        } else {
            _callback_function = callback_function;
            element = document.createElement("div");
            element.innerHTML = FORM;
            element.style.textAlign = "center";
            parent.appendChild(element);
            document._basic_data_form.sname.focus();
            document._basic_data_form.onsubmit = function () { return false; };
            document._basic_data_form.start.onclick = basic_data_receiver;
        }
    };

    var basic_data_receiver = function () {
        var id, sex;

        if (USE_FULLSCREEN_API) {
            set_window_to_full_screen();
        }
        id = document._basic_data_form.sname.value;
        if (id) {
            id = id.replace(/\s/g, "");
        }
        sex = document._basic_data_form.sex[0].checked ? 'female' :
            (document._basic_data_form.sex[1].checked ? 'male': null);
        if (!id) {
            alert('参加者番号が入力されていません');
            document._basic_data_form.sname.focus();
            return false;
        }
        if (sex === null) {
            alert('性別が入力されていません。');
            return false;
        }
        return _callback_function(id, sex);
    };

    // ***** 追加情報の入力
    // IO.input_other_data(id, callback_function, msg)
    //    id: 表示する領域のid
    //    callback_function: 入力完了後に入力結果を引数として呼ばれる関数
    //    msg: 呈示するメッセージ
    var input_other_data = function (parent, callback_function, msg) {
        var FORM =
            ["<p textAlign='center'><form name='_other_data_form'>",
             "<p>" + msg + "</p>",
             "<input type='text' name='text' size='10'>",
             "<p><input type='button' value='決定' name='start'></p>",
             "</form></p>"].join('');
        var element;

        parent = get_element(parent);
        if (DEBUG) {
            callback_function("DEBUGGING");
        } else {
            _callback_function = callback_function;
            element = document.createElement("div");
            element.innerHTML = FORM;
            element.style.textAlign = "center";
            parent.appendChild(element);
            document._other_data_form.text.focus();
            document._other_data_form.onsubmit = function () { return false; };
            document._other_data_form.start.onclick = other_data_receiver;
        }
    };

    var other_data_receiver = function () {
        var data;

        if (USE_FULLSCREEN_API) {
            set_window_to_full_screen();
        }
        data = document._other_data_form.text.value;
        if (!data) {
            alert('入力されていません');
            document._other_data_form.text.focus();
            return false;
        }
        return _callback_function(data);
    };

    // ***** setTimeout
    var setTimeout = function (callback, timeout) {
        if (DEBUG) {
            timeout = T_DEBUG;
        }
        return window.setTimeout(callback, timeout);
    };

    // ***** 要素を追加
    // IO.append_element(type, id, style, parent, posx, posy)
    //    type: 'div'または'img'
    //    id: 要素のid 省略/nullだと無視
    //    style: 要素のスタイルを指定するオブジェクト
    //           例 { width: 800, height: 400 }
    //           省略/nullだと無視
    //           "center"を指定すると { textAlign: "center" } と同じ
    //           "left"を指定すると { textAlign: "left" } と同じ
    //    parent: 親要素のid
    //            省略/null/''だとbodyを親要素にする
    //    posx: 左上のX座標
    //    posy: 左上のY座標
    //          posxとposyの代わりに'center'を指定すると親要素の中央に配置される
    //          中央配置するならスタイルでwidth/heightを指定すること
    var append_element = function (type, id, style, parent) {
        var element, property;

        if (type === 'div' || type === 'img' || type == 'button') {
            if (!parent) {
                parent = document.body;
            } else {
                parent = document.getElementById(parent);
            }
            element = document.createElement(type);
            parent.appendChild(element);
            if (id) {
                element.setAttribute('id', id);
            }
            if (style) {
                set_element_style(element, style);
            }
            if (arguments.length === 6) {
                place_element(element, arguments[4], arguments[5]);
            } else if (arguments.length === 5 && arguments[4] === 'center') {
                center_element(element);
            }
            if (type === 'img') {
                element.src = BLANK_IMAGE;
            }
            if (type === 'button') {
                element.setAttribute('type', 'button');
            }
        }
        return element;
    };

    // ***** 教示を表示する
    // IO.display_instruction(title, textlist, id, style)
    //    title: 実験のタイトル nullまたは''とすると表示しない
    //    textlist: 教示文の配列
    //       例: "段落1"             // 段落が1つだけの場合
    //           ["段落1", "段落2"]  // 段落が複数の場合
    //           [["文1", "left"], ["文2", "left"]]
    //                               // 複数の段落に個別にtextAlignを指定する場合
    //    id: 表示する要素またはid
    //    style: 要素のスタイルを指定するオブジェクト
    //           例 { width: 800, height: 400 }
    //           省略/nullだと無視
    //           "center"を指定すると { textAlign: "center" } と同じ
    //           "left"を指定すると { textAlign: "left" } と同じ
    var display_instruction = function (title, textlist, id_or_element, style) {
        var parent, element, type, style;

        parent = get_element(id_or_element);

        if (title) {
            element = document.createElement("h3");
            element.style.textAlign = "center";
            parent.appendChild(element);
            element.appendChild(document.createTextNode(title));
        }

        if (get_type(textlist) === TYPE_STRING) {
            textlist = [textlist];
        }
        for (var i = 0; i < textlist.length; i++) {
            type = get_type(textlist[i]);
            element = document.createElement("p");
            if (type === TYPE_STRING) {
                text = textlist[i];
            } else if (type === TYPE_ARRAY  &&
                       get_type(textlist[i][0] === TYPE_STRING)) {
                text = textlist[i][0];
                set_element_style(element, textlist[i][1]);
            }
            if (style) {
                set_element_style(element, style);
            }
            element.appendChild(document.createTextNode(text));
            parent.appendChild(element);
        }
    };

    var get_type = function (arg) {
        return Object.prototype.toString.call(arg);
    };

    var get_element = function (id_or_element) {
        var type = get_type(id_or_element);
        var element = null;
        if (type === "[object String]") {
            element = document.getElementById(id_or_element);
        } else if (type.match(/object\s+HTML\S+Element/)) {
            element = id_or_element;
        }
        if (element === null) {
            throw("存在しない領域が指定された" + id_or_element);
        }
        return element;
    };

    // ***** 要素のスタイルを設定する
    // IO.set_element_style(id, style)
    //    id: 要素または要素のid
    //    style: 要素のスタイルを指定するオブジェクト
    //           例 { width: 800, height: 400 }
    //           省略/nullだと無視
    //           "center"を指定すると { textAlign: "center" } と同じ
    //           "left"を指定すると { textAlign: "left" } と同じ
    var set_element_style = function (id_or_element, style) {
        var element = get_element(id_or_element);
        var property;

        if (style === "center" || style === "left") {
            element.style.textAlign = style;
        } else if (get_type(style) === TYPE_OBJECT) {
            for (property in style) {
                element.style[property] = style[property];
            }
        }
    };

    // ***** 要素を親要素の中央に配置する
    // IO.center_element(id)
    //    id: 要素または要素のid
    var center_element = function (id_or_element) {
        var element = get_element(id_or_element);
        var left = Math.floor(element.clientWidth / 2);
        var top = Math.floor(element.clientHeight / 2);
        element.style.position = "absolute";
        element.style.top = "50%";
        element.style.left = "50%";
        element.style.marginTop = "-" + top + "px";
        element.style.marginLeft = "-" + left + "px";
    };

    // ***** 要素を親要素の相対座標位置に配置する
    // IO.place_element(id, x, y)
    //    id: 要素または要素のid
    //    x: x座標 左端が0 単位はpx
    //    y: y座標 上端が0 単位はpx
    var place_element = function (id_or_element, x, y) {
        var element = get_element(id_or_element);
        var left = Math.floor(element.clientWidth / 2);
        var top = Math.floor(element.clientHeight / 2);
        element.style.position = "absolute";
        element.style.top = "0%";
        element.style.left = "0%";
        element.style.marginTop = "" + y + "px";
        element.style.marginLeft = "" + x + "px";
    };

    // ***** nameで指定された要素のinnerHTMLをstrに設定
    var set_html = function (str, id_or_element) {
        get_element(id_or_element).innerHTML = str;
    };

    // ***** idで指定された要素のinnerHTMLにstrを追加
    var append_html = function (str, id_or_element) {
        get_element(id_or_element).innerHTML += str;
        return str;
    };

    // ***** idで指定された要素にstrを中身とする<p>要素を追加
    var append_paragraph = function (str, id_or_element, style) {
        var e = get_element(id_or_element);
        var p = document.createElement("p");
        var t = document.createTextNode(str);
        if (style) {
            set_element_style(p, style);
        }
        p.appendChild(t);
        e.appendChild(p);
    };

    // ***** idで指定されたimg要素のsrcをimageに設定
    var set_image = function (image, id_or_element) {
        get_element(id_or_element).src = image.src;
    };

    // ***** idで指定されたdiv要素またはimg要素をクリア
    var clear = function (id_or_element) {
        var element = get_element(id_or_element);
        var type = Object.prototype.toString.call(element);
        if (type === "[object HTMLImageElement]") {
            // element.src = '' や element.src = null ではダメ(枠が表示される)
            element.src = BLANK_IMAGE;
        } else if (type === "[object HTMLDivElement]") {
            element.innerHTML = "";
        }
    };

    // ***** 全画面APIによる全画面化
    var set_window_to_full_screen = function () {
        var e = document.documentElement;
        e.style.width = "100%";
        e.style.height = "100%";
        e.style.backgroundColor = "#FFFFFF";
        if (e.webkitRequestFullscreen) {
            if (UA.indexOf('chrome') != -1) {
                e.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            } else {
                e.webkitRequestFullscreen();
            }
        } else if (e.webkitRequestFullScreen) {
            e.webkitRequestFullScreen();
        } else if (e.oRequestFullScreen) {
            e.oRequestFullScreen();
        } else if (e.mozRequestFullScreen) {
            e.mozRequestFullScreen();
        } else if (e.msRequestFullScreen) {
            e.msRequestFullScreen();
        }
    };

    // ***** キー待ち開始
    var start_waiting_for_key = function (callback_on_key) {
        if (arguments.length === 0) {
            _callback_on_key = true;
        } else {
            _callback_on_key = callback_on_key;
        }
        if (_waiting_for_key === true) {
            alert("実験プログラムの異常です。"); // 二重のキー待ちはできない
            return false;
        }
        _keyCode = null;
        _rt = null;
        _waiting_for_key = true;
        _time0 = new Date().getTime();
        return true;
    };

    // ***** キー入力があるとこの関数が呼ばれる
    var getKey = function (e) {
        var time = new Date().getTime();
        var kc = keyCode(e);

        if (_waiting_for_key === true && _keyCode === null &&
            (_valid_keys.indexOf(kc) >= 0)) {
            if (_keycheck_function) {
                _keycheck_function(kc);
            }
            if (_callback_on_key === true) {
                _waiting_for_key = false;
                if (_timeout_id) {
                    clearTimeout(_timeout_id);
                    _timeout_id = null;
                }
                _callback_function(kc, time - _time0);
            } else {
                if (_keyCode === null) {
                    _keyCode = kc;
                    _rt = time - _time0;
                }
            }
        }
    };
    document.onkeydown = getKey;

    var timeout = function () {
        var time = new Date().getTime();
        _timeout_id = null;
        if (_waiting_for_key === true) {
            _waiting_for_key = false;
            if (DEBUG) {
                if (_keycheck_function) {
                    _keycheck_function(_valid_keys.select_randomly());
                }
                if (_callback_function) {
                    _callback_function(_valid_keys.select_randomly(), RT_DEBUG());
                }
            } else {
                if (_callback_on_key === false && _keyCode) {
                    _callback_function(_keyCode, _rt);
                } else if (_callback_function) {
                    _callback_function(KEYCODE.TIMEOUT, -1);
                }
            }
        }
    };

    var set_valid_keys = function(valid_keys) {
        if (get_type(valid_keys) === TYPE_NUMBER) {
            _valid_keys = [ valid_keys ];
        } else if (get_type(valid_keys) === TYPE_ARRAY) {
            _valid_keys = valid_keys;
        }
    };

    // ***** キー入力を待つ
    // IO.wait_for_key(valid_keys, callback_function)
    //    valid_keys: 入力できるキーコードのリスト
    //                1つだけならリストにしなくてもよい
    //                例: [ IO.KEYOCDE.J, IO.KEYCODE.F ]
    //                    IO.KEYCODE.SPACE
    //    callback_function: 入力があったときに呼ばれる関数
    //                       keycodeとrtが引数として渡される
    var wait_for_key = function (valid_keys, callback_function) {
        set_valid_keys(valid_keys);
        _keycheck_function = null;
        _callback_function = callback_function;
        start_waiting_for_key();
    };

    // ***** ラジオボタンで選択
    // IO.select_option(message, id_or_element, options, callback_function)
    //    message: 表示する文字列
    //    id_or_element: フォームを表示する領域またはid
    //    options: 属性名と値の並びを組にしたオブジェクト
    //          例: { length: ["長さ", [{ name: "長" }, { name: "短" }]],
    //                angle: ["角度" [{ name: "狭" }, { name: "広" }]] }
    //          値はnameというプロパティを持つオブジェクト
    //          nameはフォームに表示する文字列
    //    callback_function: 完了時に呼ぶ関数
    //          選択されたオプションの番号(0, 1, 2...)の配列が引数として渡される
    var select_option = function (message, id_or_element, options, callback_function) {
        var i, element, string;

        _callback_function = callback_function;
        string = "<center><p>" + message + "</p><form id='_select_form'><p>";
        element = get_element(id_or_element);
        _options = options;
        for (i in options) {
            if (options.hasOwnProperty(i)) {
                string += options[i][0] + ":&nbsp;";
                for (j = 0; j < options[i][1].length; j++) {
                    string += "<input type='radio' name='" + i + "' value='" + j +
                        "'>" + options[i][1][j].name + "&nbsp;";
                }
                string += "<br>";
            }
        }
        string += "</p><p><input type='button' name='select' value='決定'></p></form></center>";
        element.innerHTML = string;
        document.getElementById("_select_form").select.onclick = select_option_receiver;
    };

    var select_option_receiver = function () {
        var radio, checked, i, j, checked_item = {}, ok;
        
        for (i in _options) {
            if (_options.hasOwnProperty(i)) {
                radio = document.getElementById("_select_form")[i];
                if (radio) {
                    checked = -1;
                    for (j = 0; j < radio.length; j++) {
                        if (radio[j].checked === true) {
                            checked = j;
                            break;
                        }
                    }
                    if (checked !== -1) {
                        checked_item[i] = _options[i][1][j];
                    }
                } else {
                    break;
                }
            }
        }
        ok = true;
        for (i in _options) {
            if (_options.hasOwnProperty(i)) {
                if (checked_item[i] === undefined) {
                    ok = false;
                    break;
                }
            }
        }
        if (ok) {
            for (i in _options) {
                if (_options.hasOwnProperty(i)) {
                    _options[i] = checked_item[i];
                }
            }
            _callback_function();
        }
    };

    // ***** 複数の刺激呈示のあとキー入力を待つ
    // IO.present_stimuli_and_wait_for_key(data, valid_keys, callback, keycheck)
    //    data: 以下のいずれかの刺激の配列
    //          文字列・次の文字列までのSOA・表示する領域のid
    //          画像・次の刺激までのSOA・img要素のid
    //          音声・次の刺激までのSOA
    //         [ [image, soa1, id1],
    //           [string, soa2, id2],
    //           [sound,  soa3],  ... ]
    //          最後の刺激で指定したsoaが負なら入力まで待つ
    //          0でなければその時間でタイムアウトし、
    //          call_fが引数IO.KEYCODE.TIMEOUTで呼ばれる
    //          最後の刺激の4番目の要素がfalseならキー入力があってもcallbackは呼ばれず、
    //          タイムアウトの時に呼ばれる(keycodeとrtは正しくセットされる)
    //    valid_keys: 入力できるキーコードのリスト
    //                1つだけならリストにしなくてもよい
    //                例: [ IO.KEYOCDE.J, IO.KEYCODE.F ]
    //                    IO.KEYCODE.SPACE
    //    callback: 完了時に呼ぶ関数 keycodeとrtが引数として渡される
    //    keycheck: キー入力があったときに呼び出される関数
    //              keycodeが引数として渡される
    //              trueを返せば正しいキーが入力されたとみなされ、false
    //              を返せば引き続きキー待ち状態になる
    //              通常指定する必要はない(省略してよい)が、キー入力が
    //              あってもcallbackが呼ばれないにもかかわらずキー入力
    //              に対する反応を定義したいときに使う

    var present_stimuli_and_wait_for_key = function (stimuli_src, valid_keys, callback_function, keycheck_function) {
        var STRING = 0, IMAGE = 1, AUDIO = 2;

        var i, error, type, stimuli, object;
        var index;

        var present = function () {
            var stimulus = stimuli[index];
            var type = stimulus.type;
            var soa = stimulus.soa;

            // 刺激呈示
            if (type === STRING) {
                stimulus.element.innerHTML = stimulus.data;
            } else if (type === IMAGE) {
                stimulus.element.src = stimulus.data.src;
            } else if (type === AUDIO) {
                stimulus.data.play();
            }

            if (index < stimuli.length - 1) {   // 次に進む
                index = index + 1;
                if (soa <= 0) { // 負だったら0とみなす
                    present();
                } else {
                    setTimeout(present, soa);
                }
            } else {    // 最後の刺激の場合のキー待ち処理
                if (soa >= 0) {
                    _timeout_id = setTimeout(timeout, stimulus.soa);
                    start_waiting_for_key(stimulus.callback_on_key);
                } else {
                    start_waiting_for_key(true);
                }
            }
        };

        set_valid_keys(valid_keys);
        if (get_type(keycheck_function) === TYPE_FUNCTION) {
            _keycheck_function = keycheck_function;
        } else {
            _keycheck_function = null;
        }
        if (callback_function) {
            _callback_function = callback_function;
        }
        stimuli = [];
        error = null;
        for (i = 0; i < stimuli_src.length; i++) {
            if (get_type(stimuli_src[i]) !== "[object Array]") {
                alert("刺激呈示の書式が正しくありません。");
                return false;
            } else {
                object = {};
                type = get_type(stimuli_src[i][0]);
                if ((type === TYPE_STRING || type === TYPE_IMAGE) &&
                    stimuli_src[i].length >= 3) {
                    object.type = (type === TYPE_STRING) ? STRING : IMAGE;
                    object.data = stimuli_src[i][0];
                    object.element = get_element(stimuli_src[i][2]);
                    if (object.element === null) {
                        error = "" + (i + 1) +
                            "番目の刺激を呈示する領域がありません。";
                    }
                } else if (type === TYPE_AUDIO && stimuli_src[i].length >= 2) {
                    object.type = AUDIO;
                    object.data = stimuli_src[i][0];
                    object.soa = stimuli_src[i][1];
                } else {
                    error = "" + (i + 1) + "番目の刺激の書式が正しくありません。" + type;
                }

                if (get_type(stimuli_src[i][1]) === TYPE_NUMBER) {
                    object.soa = DEBUG ? T_DEBUG : stimuli_src[i][1];
                } else {
                    error = "" + (i + 1) + "番目の刺激のSOAが数値ではありません。";
                }

                object.callback_on_key = false;
                if (stimuli_src[i].length >= 4 && stimuli_src[i][3] === false) {
                    object.callback_on_key = false;
                }

                if (error) {
                    window.alert(error);
                    return false;
                } else {
                    stimuli.push(object);
                }
            }
        }
        index = 0;
        present();
        return true;
    };

    // ***** 評定尺度を表示して入力を待ち、結果を返す
    var point_scale_receiver = function () {
        var result;
        result = document._point_scale_form.point.value;
        if (result === "") {
            return false;
        } else {
            return _callback_function(Number(result));
        }
    };

    var point_scale = function (string, points, id_or_element, callback_function) {
        var parent, element, str, i, max = points;
        parent = get_element(id_or_element);

        element = document.createElement("p");
        parent.appendChild(element);
        str = "<form name=\"_point_scale_form\"><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr><td></td><td colspan=\"" + max + "\" align=\"center\">" + string + "<br><br></td><td></td></tr><tr><td></td>";
        for (i = 1; i <= max; i++) {
            str += "<td align=\"center\">" + i + "</td>";
        }
        str += "<td></td></tr><tr><td>全く知らない</td>";
        for (i = 1; i <= max; i++) {
            str += ("<td><img src=\"../IMAGE/scale/scale_" +
                    ((i === 1) ? "l" : ((i === max) ? "r" : "m")) +
                    ".png\"</td>");
        }
        str += "<td>よく知っている</td></tr><tr><td></td>";
        for (i = 1; i <= max; i++) {
            str += "<td align=\"center\"><input type=\"radio\" name=\"point\" value=\"" + i + "\"></td>";
        }
        str += "<td></td></tr><tr><td></td><td colspan=\"" + max + "\" align=\"center\"><input type=\"button\" value=\"決定\" name=\"done\"></td><td></td></tr></table></form>";
        element.innerHTML = str;
        _callback_function = callback_function;
        document._point_scale_form.done.onclick = point_scale_receiver;
        document._point_scale_form.onsubmit = function () { return false; };
    };

    // ***** データ保存
    // IO.save_data(folder_name, file_name, result_string, id_or_element, mode)
    //    folder_name: フォルダ名
    //    file_name: 保存ファイル名
    //       フォルダ名・ファイル名にはアルファベット・数字・"-"・"_"しか使えない。
    //       それ以外の文字は削除される。
    //    result_string: 保存ファイルに書く文字列
    //    id_or_element: 結果を表示する領域
    //    mode: "append"ならネットワーク保存のとき同名ファイルに上書きしない(追記する)
    //          "local"なら強制的にローカル保存する

    var createXMLHttpRequest = function () {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                return new ActiveXobject("Msxml2.XMLHTTP");
            } catch (e2) {
                return null;
            }
        } else {
            return null;
        }
    };

    var save_data = function (folder_name, file_name, result_string, id_or_element, mode) {
        var saved = false;
        var element = get_element(id_or_element);
        var save_data_via_network = function() {
            var callback = function () {
                if (httpObject.status === 200) {
                    var result = httpObject.responseText;
                    // window.alert(result); // デバッグ用
                    if (result === "ok") {
                        saved = true;
                    }
                }
                if (saved) {
                    append_paragraph("実験データのネットワーク保存に成功しました。",
                                     element,
                                     "center");
                } else {
                    window.alert("実験データのネットワーク保存に失敗しました。\nローカル保存を試みます。");
                    save_data_locally();
                }
            };
            var httpObject = createXMLHttpRequest();
            var my_file_name;

            if (folder_name === "" && file_name === "") {
                my_file_name = DEFAULT_SAVE_FILE_NAME;
            } else if (file_name === "") {
                my_file_name = folder_name;
            } else {
                my_file_name = file_name;
            }
            my_file_name += ("." + SAVE_FILE_NAME_EXT);
            if (httpObject) {
                httpObject.open("POST", SAVER_URL, true);
                httpObject.timeout = SAVER_TIMEOUT;
                httpObject.onloadend = callback;
                httpObject.send(["folder=", encodeURIComponent(folder_name),
                                 "&file=", encodeURIComponent(my_file_name),
                                 "&result=", encodeURIComponent(result_string),
                                 "&append=", (mode === "append" ? 'true' : 'false')].join(''));
            } else {
                alert("このブラウザでは実験データのネットワーク保存が動作しません。\nローカル保存を試みます。");
                save_data_locally();
            }
        };

        var save_data_locally = function () {
            var blob;
            var blobURL;
            var saved = false;
            var clicked = false;
            var my_file_name;
            var clear = function () {
                document.getElementById("_link").innerHTML = "データをローカルファイルに保存済です。ここをクリックすると再保存できます。";
                if (clicked) {
                    if (!confirm("既に保存済ですが、再度保存しますか?")) {
                        return false;
                    }
                }
                clicked = true;
                return true;
            };

            if (folder_name === "" && file_name === "") {
                my_file_name = DEFAULT_SAVE_FILE_NAME;
            } else if (folder_name === "" || file_name === "") {
                my_file_name = folder_name + file_name;
            } else {
                my_file_name = filder_name + "_" + file_name;
            }

            if ("Blob" in window) {
                blob = new Blob([result_string], {type: "text/plain"});
            } else {
                var bb;
                bb = new (window.MozBlobBuilder ||
                          window.WebKitBlobBuilder ||
                          window.BlobBuilder)();
                if (bb !== undefined) {
                    bb.append(result_string);
                    blob = bb.getBlob();
                }
            }
            if (blob !== undefined) {
                blobURL = window.URL.createObjectURL(blob);

                var p = document.createElement("p");
                p.innerHTML =
                    ["<a href='", blobURL, "' ",
                     " download='", my_file_name, ".", SAVE_FILE_NAME_EXT, "'",
                     " id='_link'>", 
                     "ここをクリックして実験データを保存してください</a>"].join('');
                element.appendChild(p);
                document.getElementById("_link").onclick = clear;
                saved = true;
            }
            if (!saved) {
                window.alert("ローカル保存ができなかったので画面に実験データを表示します。\nコピー&ペーストなどでファイルに保存してください。\n");
                document.body.innerText = result_string;
            }
        };

        if (mode !== "local" && SAVE_MODE !== "local") {
            save_data_via_network();
        } else {
            save_data_locally();
        }
    };

    // ***** 画像の読み込み
    // IO.load_images(list, callback_function)
    //    list: 画像名、または名前と画像名の配列のリスト
    //    callback_function: 処理が終了すると呼ばれる関数
    // 例: IO.load_images(["A", "B", "C", ["fix", "asterisk"]], func)
    //     処理が終了するとfuncが呼ばれ、引数としてobjが渡される。
    //     objは"A", "B", "C", "fix"という名前のプロパティを持っており、
    //     それぞれの値は画像ファイルの読み込まれたImage。
    //
    // 画像ファイルはIMAGE_DIRの下から以下のルールで読み込まれる。
    //
    // ・画像名に"."も"/"も含まれていない
    //   ・画像名が1文字
    //     ・画像名が大文字アルファベット → IMAGE_DIR/capital/画像名+IMAGE_EXT
    //     ・画像名が小文字アルファベット → IMAGE_DIR/small/画像名+IMAGE_EXT
    //     ・画像名が数字 → IMAGE_DIR/number/画像名+IMAGE_EXT
    //       IMAGE_DIR,IMAGE_EXTは標準では"/jsexp/img"および".png"。
    //       この場合、たとえば画像名が"A"なら /jsexp/img/capital/A.png が読まれる
    //   ・画像名が2文字以上
    //       → IMAGE_DIR/symbol/画像名+IMAGE_EXT
    // ・画像名に"."か"/"が含まれている
    //     → 画像名 (IMAGE_DIRもIMAGE_EXTも付けない)
    //     画像名が"/"で始まっていなければindex.htmlからの相対パスになる

    var load_images = function (list, callback_function) {
        return load_media(IMAGE, list, callback_function);
    };

    var load_audios = function (list, callback_function) {
        return load_media(AUDIO, list, callback_function);
    };

    var load_media = function (type, list, callback_function) {
        var obj = {};
        var index = 0, name, src;
        var CAPITAL = "/capital/", SMALL = "/small/", NUMBER = "/number/";
        var SYMBOL = "/symbol/";
        var audio_dir = AUDIO_DIR + "/", audio_ext;
        var image_ext = "." + IMAGE_EXT;

        var conv_src_name = function (name) {
            var dir;

            if (name.match(/\//)) {
                if (name.match(/\./)) { return name; }
                else {
                    if (type === AUDIO) { return name + audio_ext; }
                    else { return name + image_ext; }
                }
            } else if (type === AUDIO) {
                return audio_dir + name + audio_ext;
            } else if (name.length === 1) {
                if (name.match(/[A-Z]/))      { dir = CAPITAL; }
                else if (name.match(/[a-z]/)) { dir = SMALL; }
                else if (name.match(/[0-9]/)) { dir = NUMBER; }
                return IMAGE_DIR + dir + name + image_ext;
            } else {
                return IMAGE_DIR + SYMBOL + name + image_ext;
            }
        }
        var check_playable_audio_type = function () {
            var audio = new Audio(), ext = null;

            if (audio.canPlayType) {
                AUDIO_EXTS.forEach(function (t) {
                    if (!ext && audio.canPlayType("audio/" + t) != "") {
                        ext = "." + t;
                    };
                });
            }
            if (ext === null) {
                alert("再生できる音声ファイル形式がありません。");
                return false;
            }
            return ext;
        };
        var onload = function(img, handler) {
            if ("onreadystatechange" in img) { // IE
                element.onreadystatechange = function (e) {
                    if (img.readyState === "loaded" ||
                        img.readyState === "complete") {
                        return handler(e);
                    } else {
                        return false;
                    }
                };
            } else {
                img.onload = handler;
            }
        };
        var fail = function () {
            alert(src + (type === IMAGE ?
                         "という画像ファイルが読みこめません" :
                         "という音声ファイルが読みこめません"));
            return false;
        };
        var sub = function () {
            var media;

            if (type === IMAGE) {
                media = new Image();
            } else {
                media = new Audio();
                media.autoplay = false;
                media.preload = "auto";
            }

            if (get_type(list) !== TYPE_ARRAY) { return callback_function(); }
            if (index >= list.length) { return callback_function(obj); }
            name = src = list[index];
            if (get_type(name) === TYPE_ARRAY) {
                if (name.length >= 2) {
                    src = name[1];
                    name = name[0];
                } else {
                    src = name[0];
                    name = name[0];
                }
            }
            index += 1;
            obj[name] = media;
            if (type === IMAGE) {
                media.onload = sub;
                media.onerror = fail;
                media.src = conv_src_name(src);
            } else if (type === AUDIO) {
                // 13-11-12現在、Chromeではaudio.onload()が発生しない。
                // しょうがないので待たずに次へ
                media.src = conv_src_name(src);
                return sub();
            }
            return true;
        };

        if (get_type(callback_function) !== TYPE_FUNCTION) {
            alert("IO.get_imagesの第2引数に関数が指定されていません。");
            return false;
        }

        if (type === AUDIO) {
            audio_ext = check_playable_audio_type();
        }
        return sub();
    };

    // オブジェクトの定義
    var that = {};
    // 外部から参照できる定数
    that.KEYCODE = KEYCODE;
    // ***** 外部から呼べるメソッド
    that.make_sequence = make_sequence;
    that.make_random_number = make_random_number;
    that.keyCode = keyCode;
    that.append_element = append_element;
    that.set_element_style = set_element_style;
    that.center_element = center_element;
    that.place_element = place_element;
    that.set_html = set_html;
    that.set_image = set_image;
    that.clear = clear;
    that.set_window_to_full_screen = set_window_to_full_screen;

    that.input_basic_data = input_basic_data;
    that.input_other_data = input_other_data;
    that.display_instruction = display_instruction;
    that.append_paragraph = append_paragraph;
    that.setTimeout = setTimeout;
    that.select_option = select_option;
    that.wait_for_key = wait_for_key;
    that.present_stimuli_and_wait_for_key = present_stimuli_and_wait_for_key;
    that.point_scale = point_scale;
    that.save_data = save_data;
    that.load_images = load_images;
    that.load_audios = load_audios;
    return that;
}());

// ***** Arrayの拡張

// select_randomly() 配列の要素を1つランダムに返す
// 例: [1, 2, 3].select_randomly() => 1
Array.prototype.select_randomly = function () {
    return this[Math.floor(Math.random() * this.length)];
};

// sort_num() 数値順にソート(破壊的)
// 例: [10, 1, 2].sort_num() => [1, 2, 10]
//     [['a', 'x', 1], ['a', 'y', 1], ['b', 'x', 1], ['b', 'y', 1]]
Array.prototype.sort_num = function () {
    this.sort(function (a, b) { return (a < b) ? -1 : ((a > b) ? 1 : 0); } );
    return this;
};

// shuffle() 配列をランダムにシャッフルする(破壊的)
// 例: [1, 2, 3].shuffle() => [ 3, 1, 2 ]
Array.prototype.shuffle = function() {
    for (var i = this.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = this[i];
        this[i] = this[j];
        this[j] = t;
    }
    return this;
};

// flatten1() 配列の中の配列を1段階だけ展開したものを返す(非破壊的)
// 例: [ [0, 1], [2, [3, 4]], 5 ].flatten1() => [ 0, 1, 2, [3, 4], 5 ]
Array.prototype.flatten1 = function() {
    return Array.prototype.concat.apply([], this);
};

// repeat(n) 各要素をn回ずつ繰り返した配列を返す(非破壊的)
// 例: [0, 1, 2].repeat(3) => [0, 0, 0, 1, 1, 1, 2, 2, 2]
Array.prototype.repeat = function (n) {
    var i, j, array;

    array = [];
    for (i = 0; i < this.length; i++) {
        for (j = 0; j < n; j++) {
            array.push(this[i]);
        }
    }
    return array;
};

// map(func) 各要素に関数funcを適用したものを要素とする配列を返す(非破壊的)
// 例: [1, 2, 3].map(function (x) { return x + 1; }) => [2, 3, 4]
Array.prototype.map = function (func) {
    var i, array = [];
    for (i = 0; i < this.length; i++) {
        array[i] = func(this[i]);
    }
    return array;
};

// select() 引数として与えた関数が真になる要素だけを集めて返す
// 例: [1,2,3].select(function (x) { return (x % 2 !== 0) ? true : false }); => [1, 3]
Array.prototype.select = function (func) {
    var i, array = [];
    for (i = 0; i < this.length; i++) {
        if (func(this[i])) {
            array.push(this[i]);
        }
    }
    return array;
};

// reject() 引数として与えた関数が真になる要素だけを集めて返す
// 例: [1,2,3].reject(function (x) { return (x % 2 !== 0) ? true : false }); => [2]
Array.prototype.select = function (func) {
    var i, array = [];
    for (i = 0; i < this.length; i++) {
        if (func(this[i]) === false) {
            array.push(this[i]);
        }
    }
    return array;
};

// find() 引数として与えた関数が初めて真になる位置を返す(一つも真にならなければ-1)
// 例: [1,2,3].find(function (x) { return (x % 2 !== 0) ? true : false }); => 0
Array.prototype.select = function (func) {
    var i;
    for (i = 0; i < this.length; i++) {
        if (func(this[i])) {
            return i;
        }
    }
    return -1;
};

// combine() 要素を組み合わせる(非破壊的)
// 例: [['a', 'b'], ['x', 'y'], 1].combine() =>
//     [['a', 'x', 1], ['a', 'y', 1], ['b', 'x', 1], ['b', 'y', 1]]
Array.prototype.combine = function () {
    var i, j, k, target, result, length, array, element;

    length = this.length;
    array = [this.slice(0)];
    for (target = 0; target <= length; target++) {
        result = [];
        for (i = 0; i < array.length; i++) {
            if (Object.prototype.toString.call(array[i][target]) === "[object Array]") {
                for (j = 0; j < array[i][target].length; j++) {
                    element = [];
                    for (k = 0; k < array[i].length; k++) {
                        if (k === target) {
                            element.push(array[i][k][j]);
                        } else {
                            element.push(array[i][k]);
                        }
                    }
                    result.push(element);
                }
            } else {
                element = [];
                for (k = 0; k < array[0].length; k++) {
                    element.push(array[i][k]);
                }
                result.push(element);
            }
        }
        array = result;
    }
    return array;
};

// Stringの拡張
String.prototype.tohankaku = function () {
    return this.replace(/[０-ｚ]/g,
                        function(char) {
                            return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
                        }
                       );
}

// ***** Objectの拡張

Object.prototype.init_property = function (name, value) {
    if (this[name] === undefined) { this[name] = value; }
    return this;
};

// ***** Numberの拡張

// round_down(n) 小数点以下n桁までの数を返す
// 例: 1.2345.round_down(3) => 1.234
//     -1.2345.round_down(3) => -1.234
Number.prototype.round_down = function (n) {
    n = Math.floor(n);
    if (n < 0) return this;
    if (this < 0) return Math.ceil(this * Math.pow(10, n)) / Math.pow(10, n);
    return Math.floor(this * Math.pow(10, n)) / Math.pow(10, n);
};
