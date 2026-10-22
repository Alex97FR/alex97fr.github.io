const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// These DOM stubs let the real page scripts run without installing dependencies.
function load(file, stored = null, failSave = false) {
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const elements = new Map();
  const element = () => ({
    value: '', checked: false, hidden: true, dataset: {}, events: {},
    classList: { toggle() {}, contains() { return false; } },
    append() {}, replaceChildren() {}, setAttribute() {}, focus() {},
    addEventListener(type, callback) { this.events[type] = callback; }
  });
  const get = id => {
    if (!elements.has(id)) elements.set(id, element());
    return elements.get(id);
  };
  get('start-number').value = '1';
  let writes = 0;
  const context = vm.createContext({
    TextEncoder, Date, console: { assert: (value, message) => assert.ok(value, message) },
    document: { getElementById: get, createElement: element, createDocumentFragment: element, querySelectorAll: () => [] },
    localStorage: { getItem: () => stored, setItem: () => { if (failSave) throw new Error('Quota exceeded'); writes++; } }
  });
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  for (const script of scripts) new vm.Script(script[1], { filename: file });
  vm.runInContext(scripts.at(-1)[1], context);
  return { get, run: source => vm.runInContext(source, context), writes: () => writes };
}

const vcf = load('vcf.html');
assert.equal(vcf.run("parseContacts('客户01 13800000000').found[0].phone"), '13800000000');
assert.equal(vcf.run("parseContacts('客户01 13800000000').found[0].name"), '客户01');
assert.equal(vcf.run("parseContacts('张三 (020) 1234-5678').found[0].phone"), '02012345678');
assert.equal(vcf.run('parseContacts(' + JSON.stringify('张三,13800000000\r\n李四\t+33 6 00 00 00 01\r王五 13900000000') + ').found.length'), 3);
assert.equal(vcf.run('parseContacts(' + JSON.stringify('无号码\n无效 123\n过长 1234567890123456\n13800000000') + ').rejected.length'), 4);
assert.equal(vcf.run('escapeVcf(' + JSON.stringify('甲;乙,丙\\丁\r\n下一行') + ')'), '甲\\;乙\\,丙\\\\丁\\n下一行');
const longName = 'FN:' + '很长的中文姓名😀'.repeat(20);
const folded = vcf.run(`foldVcfLine(${JSON.stringify(longName)})`);
assert.equal(folded.replace(/\r\n /g, ''), longName);
assert.ok(folded.split('\r\n').every(line => Buffer.byteLength(line, 'utf8') <= 75));
vcf.get('source').value = '张三 +33 6 00 00 00 01';
vcf.get('parse').events.click();
assert.equal(vcf.get('download').disabled, false);
assert.match(vcf.run('makeVcf()'), /TEL;TYPE=CELL,VOICE:\+33600000001\r\nEND:VCARD\r\n$/);
vcf.get('source').events.input();
assert.equal(vcf.get('download').disabled, true);
assert.equal(vcf.run('contacts.length'), 0);

const wa = load('whatsapp.html');
wa.get('phone-prefix').value = '33';
assert.equal(wa.run("linkFor('600000001')"), 'https://wa.me/33600000001');
assert.equal(wa.run("linkFor('+86 138 0000 0000')"), 'https://wa.me/8613800000000');
assert.equal(wa.run("linkFor('0033 6 00 00 00 01')"), 'https://wa.me/33600000001');
assert.equal(wa.run("linkFor('33600000001')"), 'https://wa.me/33600000001');
for (const number of ['', 'abc12345678', '123', '+0123456789', '1234567890123456']) {
  assert.equal(wa.run(`linkFor(${JSON.stringify(number)})`), '');
}
assert.equal(wa.run("resultFor({ name: '缺少号码', phone: '' }, 0, 1)"), '');
assert.equal(wa.run("splitContact('客户01 13800000000').name"), '客户01');
assert.equal(wa.run("splitContact('张三 (33) 600000001').phone"), '(33) 600000001');
assert.equal(wa.run('pasteIntoRows(' + JSON.stringify('甲\t33600000001\r\n乙\t\r\n') + ", 0, 'name')"), 2);
assert.equal(wa.run('rows[1].phone'), '');
wa.run("pasteIntoRows('8613800000000', 0, 'phone')");
assert.equal(wa.run('rows[0].name'), '甲');
wa.get('start-number').value = '-5';
assert.equal(wa.run('startNumber()'), 1);

const saved = JSON.stringify([{ id: 'old', text: '已有事项', done: false }]);
const todo = load('todo.html', saved);
assert.equal(todo.run('items[0].text'), '已有事项');
todo.get('new').value = '新事项';
todo.get('new').events.keydown({ key: 'Enter', isComposing: true });
assert.equal(todo.run('items.length'), 1);
todo.get('add').events.click();
assert.equal(todo.run('items.length'), 2);
assert.equal(todo.writes(), 1);
todo.run("dragId = 'old'; reorder(items[0].id)");
assert.equal(todo.run('items[0].id'), 'old');
todo.get('search').value = '已有';
assert.equal(todo.run('visible().length'), 1);
for (const broken of ['not json', '[null]', '{}']) {
  const page = load('todo.html', broken);
  assert.equal(page.get('add').disabled, true);
  page.get('new').value = '不要覆盖原存储';
  page.get('add').events.click();
  assert.equal(page.writes(), 0);
}
const full = load('todo.html', saved, true);
full.get('new').value = '存储失败也应保留在页面';
full.get('add').events.click();
assert.equal(full.run('items.length'), 2);
assert.equal(full.get('storage-status').hidden, false);
console.log('通过：VCF 解析与导出、WhatsApp 区号与粘贴、待办兼容与存储异常。');

const pages = ['index.html', 'vcf.html', 'whatsapp.html', 'todo.html'];
for (const file of pages) {
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, file + ': one main heading');
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1, file + ': one active navigation entry');
  assert.match(html, /<title>Everyday Tools<\/title>/);
  for (const [, href] of html.matchAll(/href="([^"#]+)"/g)) {
    if (/^https?:/.test(href)) continue;
    assert.ok(fs.existsSync(path.join(__dirname, '..', href.split(/[?#]/)[0])), file + ': missing ' + href);
  }
}
assert.match(fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8'), /class="tool-grid"/);
console.log('通过：首页工具入口、四个页面导航及本地资源路径。');
