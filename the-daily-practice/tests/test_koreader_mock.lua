-- KOReader-like event smoke test WITHOUT Kindle hardware.
-- Loads a modified copy of plugin code in memory. Leaves its on-disk safety flag off.
local path = "integrations/koreader/dailypractice.koplugin/main.lua"
local handle = assert(io.open(path, "r"))
local source = assert(handle:read("*a")); handle:close()
assert(source:find("local ENABLE_EXPERIMENTAL_PLUGIN = false", 1, true))
local patched, number = source:gsub("local ENABLE_EXPERIMENTAL_PLUGIN = false", "local ENABLE_EXPERIMENTAL_PLUGIN = true")
assert(number == 1)

local folder = os.tmpname() .. "_dp_test"
local mkdir_result = os.execute('mkdir -p "' .. folder .. '"')
assert(mkdir_result == true or mkdir_result == 0, "failed to create isolated test directory")
package.preload["datastorage"] = function()
  return {getSettingsDir = function() return folder end}
end
package.preload["gettext"] = function() return function(s) return s end end
package.preload["ui/uimanager"] = function() return {show=function() end} end
package.preload["ui/widget/infomessage"] = function() return {new=function(_, o) return o end} end
package.preload["ui/widget/container/widgetcontainer"] = function()
  return {extend=function(_, fields) return fields end}
end

local original_time = os.time
local clock = original_time()
os.time = function() return clock end
local loader = loadstring or load
local code = assert(loader(patched, "@dailypractice-test-main.lua"))
local Plugin = code()
assert(type(Plugin) == "table" and Plugin.name == "dailypractice")
local menu_host = {registerToMainMenu=function() end}
local function newInstance()
  local instance = {ui={menu=menu_host, document={file="synthetic.epub"}}}
  setmetatable(instance, {__index=Plugin})
  instance:init()
  return instance
end
local plugin = newInstance()
assert(plugin.read_pages == 0)
local menu = {}; plugin:addToMainMenu(menu)
assert(menu.dailypractice_status)
plugin:onPageUpdate(1)
plugin:onPageUpdate(1) -- duplicate event should do nothing
clock = clock + 6
plugin:onPageUpdate(2)
assert(plugin.read_pages == 1, "expected first qualified page")
clock = clock + 6
plugin:onPageUpdate(1) -- backward is not counted
assert(plugin.read_pages == 1, "backward page turn must not count")
clock = clock + 6
plugin:onPageUpdate(2) -- revisit page 1 already seen
assert(plugin.read_pages == 1, "repeated page should not count")
clock = clock + 6
plugin:onPageUpdate(3)
assert(plugin.read_pages == 2 and plugin.completed == true, "two distinct pages should complete read goal")
plugin:onSuspend(); clock = clock + 1800
plugin:onPageUpdate(4)
assert(plugin.read_pages == 2, "no progress while suspended")
plugin:onResume()
plugin:onCloseDocument()
local restarted = newInstance()
assert(restarted.read_pages == 2 and restarted.completed == true, "reload aggregate count")
-- Remove only synthetic artifacts in temporary location.
os.remove(folder .. "/dailypractice_reading.tsv")
os.remove(folder .. "/dailypractice_reading.tsv.tmp")
os.execute('rmdir "' .. folder .. '"')
os.time = original_time
print('PASS: simulated KOReader page changes, duplicate events, suspend, and saved count')
