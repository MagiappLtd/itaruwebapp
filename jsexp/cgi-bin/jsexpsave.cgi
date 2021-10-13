#!/usr/bin/ruby
# -*- coding: utf-8 -*-

TOPDIR = "../DATA"

require 'cgi'
$cgi = CGI.new
$dir_name = $cgi['folder']
$file_name = $cgi['file']
$result_string = $cgi['result']
$append = $cgi['append']

print "Content-type: text/plain\n\n"

ok = true

# 特殊文字を入力された場合の危険を避けるため、ディレクトリ/ファイル名に
# はアルファベット大小文字・数字・"_"・"-"・"."しか許さない
$dir_name.gsub!(/[^A-Za-z0-9_\.-]/, '')
$file_name.gsub!(/[^A-Za-z0-9_\.-]/, '')
# ディレクトリ名・ファイル名先頭の"."は不可
$dir_name.gsub!(/^\.+/, '')
$file_name.gsub!(/^\.+/, '')

if $dir_name == '' or $file_name == ''
  ok = false
else
  begin
    Dir.mkdir("#{TOPDIR}/#{$dir_name}") unless File.exists?("#{TOPDIR}/#{$dir_name}")
    mode = ($append == 'true' ? 'a' : 'w')
    out = open("#{TOPDIR}/#{$dir_name}/#{$file_name}", mode)
    out.flock(File::LOCK_EX)
    out.print $result_string
    out.flock(File::LOCK_UN)
    out.close
  rescue
    ok = false
  end
end
print ok ? "ok" : "ng"
