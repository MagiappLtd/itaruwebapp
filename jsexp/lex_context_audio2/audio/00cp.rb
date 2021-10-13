#!/usr/bin/ruby
# -*- coding: utf-8 -*-
# 練習用非単語
"chikyaku maryuu nouken syokuzoku sonhyou chokusei hense mohaku kyosa rakuou".split(" ").each_with_index do |w, i|
  system "cp ../../lex_hiragana_audio/audio/#{w}.ogg pn#{sprintf("%02d", i + 1)}.ogg"
end
# 本実験用非単語
"shicho syayoku ikyuu chousyuku syousyuku kyouzei kanyoku genhitu keietu shinma sannyoku kaijutu saijuu youetu chiketu syuhatu syuugai syoetu gocho chuuri homei ryouhatu juugai konhatu daihai renso syaen sonkyuu ganzetu denta juhatu syukusen monhitu hakusyou gakubi chinen dokukaku baiza tokubi tuimei tekikou minjitu seban funhitu shitubi datuza kieki iritu choutuu syoutuu kyouzetu kanhai genhatu keiza shinzetu sanhitu kaini sairitu youcho chiza".split(" ").each_with_index do |w, i|
  system "cp ../../lex_hiragana_audio/audio/#{w}.ogg nw#{sprintf("%02d", i + 1)}.ogg"
end
