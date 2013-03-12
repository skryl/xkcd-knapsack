require 'rubygems'
require 'bundler'
require 'json'
Bundler.require :default, (ENV["RACK_ENV"] || "development").to_sym

get '*' do
  redirect 'plate.html'
end
