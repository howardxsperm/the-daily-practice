-- Run with lua, luatex --luaonly, or another Lua interpreter.
local paths = {
  "integrations/koreader/dailypractice.koplugin/_meta.lua",
  "integrations/koreader/dailypractice.koplugin/main.lua",
}
for _, path in ipairs(paths) do
  local chunk, err = loadfile(path)
  if not chunk then error(path .. ": " .. tostring(err)) end
  print("Lua syntax OK: " .. path)
end
