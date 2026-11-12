-- The Daily Practice KOReader integration prototype.
-- DEVELOPMENT ONLY: not yet tested on a physical Kindle.
-- Modeled after KOReader's hello.koplugin and statistics.koplugin.
-- SAFETY SWITCH: keep false until tested with the matching KOReader version.
-- If copied to a Kindle while false, this plugin will not run.
local ENABLE_EXPERIMENTAL_PLUGIN = false
if not ENABLE_EXPERIMENTAL_PLUGIN then
    return { disabled = true }
end

local WidgetContainer = require("ui/widget/container/widgetcontainer")
local UIManager = require("ui/uimanager")
local InfoMessage = require("ui/widget/infomessage")
local DataStorage = require("datastorage")
local _ = require("gettext")

local Bridge = WidgetContainer:extend{
    name = "dailypractice",
    is_doc_only = false,
}

local function daily_stamp()
    return os.date("%Y-%m-%d")
end

local function record_path()
    return DataStorage:getSettingsDir() .. "/dailypractice_reading.tsv"
end

-- Atomic replacement avoids partially written records on interruption.
-- This plain-text output is designed for a future dashboard adapter to read.
local function save_record(date, pages, done)
    local destination = record_path()
    local temp = destination .. ".tmp"
    local file, err = io.open(temp, "w")
    if not file then return false, err end
    file:write(date, "\t", tostring(pages), "\t", done and "1" or "0", "\n")
    file:close()
    local ok, rename_err = os.rename(temp, destination)
    if not ok then return false, rename_err end
    return true
end

local function read_record()
    local file = io.open(record_path(), "r")
    if not file then return nil end
    local line = file:read("*l") or ""
    file:close()
    local date, pages, done = line:match("^(%d%d%d%d%-%d%d%-%d%d)\t(%d+)\t([01])$")
    if date ~= daily_stamp() then return nil end
    pages = tonumber(pages) or 0
    if pages > 100000 then return nil end
    return { pages = pages, completed = done == "1" or pages >= 2 }
end

function Bridge:init()
    self.ui.menu:registerToMainMenu(self)
    self.day = daily_stamp()
    local prior = read_record()
    self.read_pages = prior and prior.pages or 0
    self.completed = prior and prior.completed or false
    self.current_page = nil
    self.entered_page_at = nil
    self.seen = {}
    self.suspended = false
end

function Bridge:addToMainMenu(menu_items)
    menu_items.dailypractice_status = {
        text = _("The Daily Practice: reading habit"),
        sorting_hint = "more_tools",
        callback = function()
            UIManager:show(InfoMessage:new{
                text = string.format(_("Today: %d / 2 qualified pages%s"),
                    self.read_pages, self.completed and _(" — completed") or ""),
            })
        end,
    }
end

function Bridge:resetIfNewDay()
    local today = daily_stamp()
    if today ~= self.day then
        self.day = today
        self.read_pages = 0
        self.completed = false
        self.seen = {}
        self.current_page = nil
        self.entered_page_at = nil
        save_record(self.day, 0, false)
    end
end

function Bridge:onReaderReady()
    self:resetIfNewDay()
    self.current_page = nil
    self.entered_page_at = nil
    self.suspended = false
end

-- Count only a page the reader has actually spent time on before leaving it.
-- Deliberately conservative: this is not yet tied to KOReader's full stats DB.
function Bridge:onPageUpdate(page)
    if type(page) ~= "number" then return end
    self:resetIfNewDay()
    if self.suspended then return end
    if self.current_page == page then return end -- duplicate KOReader update
    local now = os.time()
    if self.current_page and self.entered_page_at then
        local secs = now - self.entered_page_at
        -- Key pages by document path + page number to avoid mixing books.
        local path = (self.ui and self.ui.document and self.ui.document.file) or "unknown"
        local key = path .. ":" .. tostring(self.current_page)
        -- A single forward progression only; don't reward backtracking or jumps.
        if page == self.current_page + 1 and secs >= 5 and not self.seen[key] then
            self.seen[key] = true
            self.read_pages = self.read_pages + 1
            if self.read_pages >= 2 then self.completed = true end
            save_record(self.day, self.read_pages, self.completed)
        end
    end
    self.current_page = page
    self.entered_page_at = now
end

function Bridge:onPosUpdate(_, page)
    if page and self.current_page ~= page then self:onPageUpdate(page) end
end

function Bridge:onSuspend()
    self.suspended = true
end
function Bridge:onResume()
    self.suspended = false
    self.entered_page_at = os.time() -- don't count suspended time
end
function Bridge:onDocumentRerendered()
    self.current_page = nil -- avoid counting font-size repagination as reading
    self.entered_page_at = nil
end
function Bridge:onCloseDocument()
    self.current_page = nil
    self.entered_page_at = nil
end

return Bridge
