import type { Word, Relationship } from '../types';

function wid(n: string) { return `w-${n}`; }

// ===== ALL NODES (words + roots + prefixes) =====
// Roots and prefixes are treated as special "words" with a tag for styling
export const presetWords: Word[] = [
  // ── 词根节点 (root hub nodes) ──
  { id: wid('root-tain'),    word: '-tain',    pronunciation: '', tags: ['词根节点'], meanings: [
    { partOfSpeech: 'root', meaning: '拿住，保持 (=hold)', definition: '', example: '', mnemonic: '拉丁语 tenēre (to hold)' },
  ], notes: '' },
  { id: wid('root-spect'),   word: '-spect',   pronunciation: '', tags: ['词根节点'], meanings: [
    { partOfSpeech: 'root', meaning: '看 (=look)', definition: '', example: '', mnemonic: '拉丁语 specere (to look)' },
  ], notes: '' },
  { id: wid('root-dict'),    word: '-dict',    pronunciation: '', tags: ['词根节点'], meanings: [
    { partOfSpeech: 'root', meaning: '说 (=say)', definition: '', example: '', mnemonic: '拉丁语 dicere (to say)' },
  ], notes: '' },
  { id: wid('root-duct'),    word: '-duct',    pronunciation: '', tags: ['词根节点'], meanings: [
    { partOfSpeech: 'root', meaning: '引导 (=lead)', definition: '', example: '', mnemonic: '拉丁语 ducere (to lead)' },
  ], notes: '' },
  { id: wid('root-mit'),     word: '-mit',     pronunciation: '', tags: ['词根节点'], meanings: [
    { partOfSpeech: 'root', meaning: '送，发出 (=send)', definition: '', example: '', mnemonic: '拉丁语 mittere (to send)' },
  ], notes: '' },
  { id: wid('root-scribe'),  word: '-scribe',  pronunciation: '', tags: ['词根节点'], meanings: [
    { partOfSpeech: 'root', meaning: '写 (=write)', definition: '', example: '', mnemonic: '拉丁语 scribere (to write)' },
  ], notes: '' },
  { id: wid('root-gress'),   word: '-gress',   pronunciation: '', tags: ['词根节点'], meanings: [
    { partOfSpeech: 'root', meaning: '走 (=step, go)', definition: '', example: '', mnemonic: '拉丁语 gradi (to step)' },
  ], notes: '' },
  { id: wid('root-vene'),    word: '-vene',    pronunciation: '', tags: ['词根节点'], meanings: [
    { partOfSpeech: 'root', meaning: '来 (=come)', definition: '', example: '', mnemonic: '拉丁语 venire (to come)' },
  ], notes: '' },

  // ── 前缀节点 (prefix hub nodes) ──
  { id: wid('pref-re'),      word: 're-',      pronunciation: '', tags: ['前缀节点'], meanings: [
    { partOfSpeech: 'pref', meaning: '回，再，重新 (=back/again)', definition: '', example: '', mnemonic: '' },
  ], notes: '' },
  { id: wid('pref-pre'),     word: 'pre-',     pronunciation: '', tags: ['前缀节点'], meanings: [
    { partOfSpeech: 'pref', meaning: '前，预先 (=before)', definition: '', example: '', mnemonic: '' },
  ], notes: '' },
  { id: wid('pref-pro'),     word: 'pro-',     pronunciation: '', tags: ['前缀节点'], meanings: [
    { partOfSpeech: 'pref', meaning: '向前，赞成 (=forward/for)', definition: '', example: '', mnemonic: '' },
  ], notes: '' },
  { id: wid('pref-con'),     word: 'con-',     pronunciation: '', tags: ['前缀节点'], meanings: [
    { partOfSpeech: 'pref', meaning: '共同，一起 (=together)', definition: '', example: '', mnemonic: '' },
  ], notes: '' },

  // ── 普通单词节点 ──
  // tain 词根群
  { id: wid('retain'),    word: 'retain',    pronunciation: '/rɪˈteɪn/',    tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '保留，保持', definition: 'to keep or continue to have', example: 'She retained her composure.', mnemonic: 're(回)+tain(拿住)' },
    { partOfSpeech: 'v.', meaning: '记住', definition: 'to remember', example: 'retain new vocabulary', mnemonic: '' },
  ], notes: '' },
  { id: wid('contain'),   word: 'contain',   pronunciation: '/kənˈteɪn/',   tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '包含，容纳', definition: 'to have inside', example: 'The box contains books.', mnemonic: 'con(一起)+tain(拿住)' },
  ], notes: '' },
  { id: wid('maintain'),  word: 'maintain',  pronunciation: '/meɪnˈteɪn/',  tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '维持，保持', definition: 'to make continue', example: 'maintain good relations', mnemonic: 'main(手)+tain(拿住)' },
  ], notes: '' },
  { id: wid('sustain'),   word: 'sustain',   pronunciation: '/səˈsteɪn/',   tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '支撑，维持', definition: 'to support', example: 'sustain growth', mnemonic: 'sus(从下)+tain(拿住)' },
  ], notes: '' },
  { id: wid('obtain'),    word: 'obtain',    pronunciation: '/əbˈteɪn/',    tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '获得，得到', definition: 'to get', example: 'obtain permission', mnemonic: 'ob(加强)+tain(拿住)' },
  ], notes: '' },
  { id: wid('detain'),    word: 'detain',    pronunciation: '/dɪˈteɪn/',    tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '扣留，拘留', definition: 'to keep from leaving', example: 'The police detained him.', mnemonic: 'de(离开)+tain(拿住)' },
  ], notes: '' },
  { id: wid('retention'), word: 'retention', pronunciation: '/rɪˈtenʃən/',  tags: ['名词'], meanings: [
    { partOfSpeech: 'n.', meaning: '保留，记忆力', definition: 'act of keeping', example: 'staff retention', mnemonic: 'retent+ion(名词后缀)' },
  ], notes: '' },

  // spect 词根群
  { id: wid('inspect'),    word: 'inspect',    pronunciation: '/ɪnˈspekt/',   tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '检查，视察', definition: 'to look carefully', example: 'inspect the factory', mnemonic: 'in(里面)+spect(看)' },
  ], notes: '' },
  { id: wid('respect'),    word: 'respect',    pronunciation: '/rɪˈspekt/',   tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '尊重，尊敬', definition: 'to admire', example: 'respect elders', mnemonic: 're(再)+spect(看)' },
  ], notes: '' },
  { id: wid('prospect'),   word: 'prospect',   pronunciation: '/ˈprɒspekt/',  tags: ['高频'], meanings: [
    { partOfSpeech: 'n.', meaning: '前景，展望', definition: 'future possibility', example: 'job prospects', mnemonic: 'pro(向前)+spect(看)' },
  ], notes: '' },
  { id: wid('suspect'),    word: 'suspect',    pronunciation: '/səˈspekt/',   tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '怀疑', definition: 'to think likely', example: 'I suspect he knows.', mnemonic: 'sus(从下)+spect(看)' },
    { partOfSpeech: 'n.', meaning: '嫌疑犯', definition: 'suspected person', example: 'a suspect', mnemonic: '' },
  ], notes: '' },
  { id: wid('retrospect'), word: 'retrospect', pronunciation: '/ˈretrəspekt/', tags: [], meanings: [
    { partOfSpeech: 'n.', meaning: '回顾，追溯', definition: 'looking back', example: 'in retrospect', mnemonic: 'retro(向后)+spect(看)' },
  ], notes: '' },

  // dict 词根群
  { id: wid('predict'),    word: 'predict',    pronunciation: '/prɪˈdɪkt/',   tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '预测，预言', definition: 'to say beforehand', example: 'predict the future', mnemonic: 'pre(提前)+dict(说)' },
  ], notes: '' },
  { id: wid('contradict'), word: 'contradict', pronunciation: '/ˌkɒntrəˈdɪkt/', tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '矛盾，反驳', definition: 'to say the opposite', example: 'contradict oneself', mnemonic: 'contra(反对)+dict(说)' },
  ], notes: '' },
  { id: wid('indicate'),   word: 'indicate',   pronunciation: '/ˈɪndɪkeɪt/',  tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '表明，指示', definition: 'to show', example: 'indicate a problem', mnemonic: 'in(里面)+dic(说)+ate' },
  ], notes: '' },

  // duct 词根群
  { id: wid('conduct'),   word: 'conduct',   pronunciation: '/kənˈdʌkt/',   tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '实施，进行', definition: 'to carry out', example: 'conduct a survey', mnemonic: 'con(一起)+duct(引导)' },
    { partOfSpeech: 'n.', meaning: '行为，举止', definition: 'behavior', example: 'professional conduct', mnemonic: '' },
  ], notes: '' },
  { id: wid('produce'),   word: 'produce',   pronunciation: '/prəˈdjuːs/',  tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '生产，制造', definition: 'to make', example: 'produce goods', mnemonic: 'pro(向前)+duce(引导)' },
  ], notes: '' },
  { id: wid('reduce'),    word: 'reduce',    pronunciation: '/rɪˈdjuːs/',   tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '减少，降低', definition: 'to make smaller', example: 'reduce costs', mnemonic: 're(往回)+duce(引导)' },
  ], notes: '' },
  { id: wid('introduce'), word: 'introduce', pronunciation: '/ˌɪntrəˈdjuːs/', tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '介绍，引入', definition: 'to bring in', example: 'introduce a policy', mnemonic: 'intro(向内)+duce(引导)' },
  ], notes: '' },
  { id: wid('deduce'),    word: 'deduce',    pronunciation: '/dɪˈdjuːs/',   tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '推断，演绎', definition: 'to conclude logically', example: 'deduce from evidence', mnemonic: 'de(向下)+duce(引导)' },
  ], notes: '' },

  // mit 词根群
  { id: wid('transmit'),  word: 'transmit',  pronunciation: '/trænzˈmɪt/',  tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '传输，传播', definition: 'to send across', example: 'transmit data', mnemonic: 'trans(跨越)+mit(送)' },
  ], notes: '' },
  { id: wid('commit'),    word: 'commit',    pronunciation: '/kəˈmɪt/',     tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '犯(罪)', definition: 'to do (crime)', example: 'commit a crime', mnemonic: 'com(完全)+mit(送)' },
    { partOfSpeech: 'v.', meaning: '承诺', definition: 'to promise', example: 'commit to the plan', mnemonic: '' },
  ], notes: '' },
  { id: wid('submit'),    word: 'submit',    pronunciation: '/səbˈmɪt/',    tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '提交', definition: 'to hand in', example: 'submit a report', mnemonic: 'sub(下面)+mit(送)' },
  ], notes: '' },
  { id: wid('dismiss'),   word: 'dismiss',   pronunciation: '/dɪsˈmɪs/',    tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '解散，解雇', definition: 'to send away', example: 'class dismissed', mnemonic: 'dis(离开)+miss(送)' },
  ], notes: '' },
  { id: wid('permit'),    word: 'permit',    pronunciation: '/pəˈmɪt/',     tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '允许', definition: 'to allow', example: 'permit smoking', mnemonic: 'per(通过)+mit(送)' },
  ], notes: '' },

  // scribe 词根群
  { id: wid('describe'),   word: 'describe',   pronunciation: '/dɪˈskraɪb/',  tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '描述', definition: 'to tell about', example: 'describe the scene', mnemonic: 'de(向下)+scribe(写)' },
  ], notes: '' },
  { id: wid('prescribe'),  word: 'prescribe',  pronunciation: '/prɪˈskraɪb/', tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '规定，开药', definition: 'to order', example: 'prescribe medicine', mnemonic: 'pre(提前)+scribe(写)' },
  ], notes: '' },
  { id: wid('subscribe'),  word: 'subscribe',  pronunciation: '/səbˈskraɪb/', tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '订阅', definition: 'to sign up for', example: 'subscribe to a channel', mnemonic: 'sub(下面)+scribe(写)' },
  ], notes: '' },

  // gress 词根群
  { id: wid('progress'),   word: 'progress',   pronunciation: '/ˈprəʊɡres/',  tags: ['高频'], meanings: [
    { partOfSpeech: 'n.', meaning: '进步，进展', definition: 'forward movement', example: 'make progress', mnemonic: 'pro(向前)+gress(走)' },
  ], notes: '' },
  { id: wid('aggressive'), word: 'aggressive', pronunciation: '/əˈɡresɪv/',   tags: ['高频'], meanings: [
    { partOfSpeech: 'adj.', meaning: '侵略的，好斗的', definition: 'hostile', example: 'aggressive behavior', mnemonic: 'ag(向)+gress(走)+ive' },
  ], notes: '' },

  // vene 词根群
  { id: wid('intervene'), word: 'intervene', pronunciation: '/ˌɪntəˈviːn/', tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '干预，介入', definition: 'to get involved', example: 'The government intervened.', mnemonic: 'inter(中间)+vene(来)' },
  ], notes: '' },
  { id: wid('prevent'),   word: 'prevent',   pronunciation: '/prɪˈvent/',   tags: ['高频'], meanings: [
    { partOfSpeech: 'v.', meaning: '阻止，预防', definition: 'to stop', example: 'prevent disease', mnemonic: 'pre(提前)+vent(来)' },
  ], notes: '' },

  // ── 同义链 ──
  { id: wid('lucid'),    word: 'lucid',    pronunciation: '/ˈluːsɪd/',    tags: [], meanings: [
    { partOfSpeech: 'adj.', meaning: '清晰的', definition: 'clearly expressed', example: 'a lucid explanation', mnemonic: 'luc(光)+id' },
  ], notes: '' },
  { id: wid('clear'),    word: 'clear',    pronunciation: '/klɪə/',       tags: [], meanings: [
    { partOfSpeech: 'adj.', meaning: '清楚的', definition: 'easy to understand', example: 'clear instructions', mnemonic: '' },
  ], notes: '' },
  { id: wid('obvious'),  word: 'obvious',  pronunciation: '/ˈɒbviəs/',    tags: ['高频'], meanings: [
    { partOfSpeech: 'adj.', meaning: '明显的', definition: 'easy to see', example: 'obvious lie', mnemonic: 'ob(对面)+via(路)+ous' },
  ], notes: '' },
  { id: wid('apparent'), word: 'apparent', pronunciation: '/əˈpærənt/',   tags: [], meanings: [
    { partOfSpeech: 'adj.', meaning: '明显的', definition: 'seeming true', example: 'apparent reason', mnemonic: 'ap+par(出现)+ent' },
  ], notes: '' },
  { id: wid('evident'),  word: 'evident',  pronunciation: '/ˈevɪdənt/',   tags: [], meanings: [
    { partOfSpeech: 'adj.', meaning: '明显的', definition: 'clearly true', example: 'evident truth', mnemonic: 'e+vid(看)+ent' },
  ], notes: '' },
  { id: wid('explicit'), word: 'explicit', pronunciation: '/ɪkˈsplɪsɪt/', tags: [], meanings: [
    { partOfSpeech: 'adj.', meaning: '明确的', definition: 'stated clearly', example: 'explicit instructions', mnemonic: 'ex(出)+plic(折)+it' },
  ], notes: '' },

  // ── 反义 ──
  { id: wid('optimistic'),  word: 'optimistic',  pronunciation: '/ˌɒptɪˈmɪstɪk/',  tags: [], meanings: [
    { partOfSpeech: 'adj.', meaning: '乐观的', definition: 'hopeful', example: 'optimistic view', mnemonic: '' },
  ], notes: '' },
  { id: wid('pessimistic'), word: 'pessimistic', pronunciation: '/ˌpesɪˈmɪstɪk/', tags: [], meanings: [
    { partOfSpeech: 'adj.', meaning: '悲观的', definition: 'expecting worst', example: 'pessimistic outlook', mnemonic: '' },
  ], notes: '' },
  { id: wid('include'), word: 'include', pronunciation: '/ɪnˈkluːd/',  tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '包含', definition: 'to contain', example: 'price includes tax', mnemonic: 'in(里面)+clude(关)' },
  ], notes: '' },
  { id: wid('exclude'), word: 'exclude', pronunciation: '/ɪkˈskluːd/', tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '排除', definition: 'to leave out', example: 'excluded from club', mnemonic: 'ex(外)+clude(关)' },
  ], notes: '' },

  // ── 基础支撑词 ──
  { id: wid('keep'),     word: 'keep',     pronunciation: '/kiːp/',      tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '保持', definition: 'to continue having', example: 'Keep the change.', mnemonic: '' },
  ], notes: '' },
  { id: wid('remember'), word: 'remember', pronunciation: '/rɪˈmembə/',  tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '记住', definition: 'to recall', example: 'I remember you.', mnemonic: '' },
  ], notes: '' },
  { id: wid('forget'),   word: 'forget',   pronunciation: '/fəˈɡet/',    tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '忘记', definition: 'to not remember', example: 'I forgot my keys.', mnemonic: '' },
  ], notes: '' },
  { id: wid('release'),  word: 'release',  pronunciation: '/rɪˈliːs/',   tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '释放', definition: 'to set free', example: 'released from prison', mnemonic: '' },
  ], notes: '' },
  { id: wid('employ'),   word: 'employ',   pronunciation: '/ɪmˈplɔɪ/',   tags: [], meanings: [
    { partOfSpeech: 'v.', meaning: '雇用', definition: 'to hire', example: 'employ 500 workers', mnemonic: '' },
  ], notes: '' },
];

// ===== RELATIONSHIPS: hub-spoke model =====
// Words connect to roots. Synonyms, antonyms, and derivatives connect word↔word.
export const presetRelationships: Relationship[] = [
  // ── Word → Root (词根) ──
  // -tain
  { id: 'r1',  sourceId: wid('retain'),    targetId: wid('root-tain'), type: 'root-share', label: '词根' },
  { id: 'r2',  sourceId: wid('contain'),   targetId: wid('root-tain'), type: 'root-share', label: '词根' },
  { id: 'r3',  sourceId: wid('maintain'),  targetId: wid('root-tain'), type: 'root-share', label: '词根' },
  { id: 'r4',  sourceId: wid('sustain'),   targetId: wid('root-tain'), type: 'root-share', label: '词根' },
  { id: 'r5',  sourceId: wid('obtain'),    targetId: wid('root-tain'), type: 'root-share', label: '词根' },
  { id: 'r6',  sourceId: wid('detain'),    targetId: wid('root-tain'), type: 'root-share', label: '词根' },
  { id: 'r7',  sourceId: wid('retention'), targetId: wid('root-tain'), type: 'root-share', label: '词根' },
  // -spect
  { id: 'r8',  sourceId: wid('inspect'),    targetId: wid('root-spect'), type: 'root-share', label: '词根' },
  { id: 'r9',  sourceId: wid('respect'),    targetId: wid('root-spect'), type: 'root-share', label: '词根' },
  { id: 'r10', sourceId: wid('prospect'),   targetId: wid('root-spect'), type: 'root-share', label: '词根' },
  { id: 'r11', sourceId: wid('suspect'),    targetId: wid('root-spect'), type: 'root-share', label: '词根' },
  { id: 'r12', sourceId: wid('retrospect'), targetId: wid('root-spect'), type: 'root-share', label: '词根' },
  // -dict
  { id: 'r13', sourceId: wid('predict'),    targetId: wid('root-dict'), type: 'root-share', label: '词根' },
  { id: 'r14', sourceId: wid('contradict'), targetId: wid('root-dict'), type: 'root-share', label: '词根' },
  { id: 'r15', sourceId: wid('indicate'),   targetId: wid('root-dict'), type: 'root-share', label: '词根' },
  // -duct
  { id: 'r16', sourceId: wid('conduct'),   targetId: wid('root-duct'), type: 'root-share', label: '词根' },
  { id: 'r17', sourceId: wid('produce'),   targetId: wid('root-duct'), type: 'root-share', label: '词根' },
  { id: 'r18', sourceId: wid('reduce'),    targetId: wid('root-duct'), type: 'root-share', label: '词根' },
  { id: 'r19', sourceId: wid('introduce'), targetId: wid('root-duct'), type: 'root-share', label: '词根' },
  { id: 'r20', sourceId: wid('deduce'),    targetId: wid('root-duct'), type: 'root-share', label: '词根' },
  // -mit
  { id: 'r21', sourceId: wid('transmit'), targetId: wid('root-mit'), type: 'root-share', label: '词根' },
  { id: 'r22', sourceId: wid('commit'),   targetId: wid('root-mit'), type: 'root-share', label: '词根' },
  { id: 'r23', sourceId: wid('submit'),   targetId: wid('root-mit'), type: 'root-share', label: '词根' },
  { id: 'r24', sourceId: wid('dismiss'),  targetId: wid('root-mit'), type: 'root-share', label: '词根' },
  { id: 'r25', sourceId: wid('permit'),   targetId: wid('root-mit'), type: 'root-share', label: '词根' },
  // -scribe
  { id: 'r26', sourceId: wid('describe'),  targetId: wid('root-scribe'), type: 'root-share', label: '词根' },
  { id: 'r27', sourceId: wid('prescribe'), targetId: wid('root-scribe'), type: 'root-share', label: '词根' },
  { id: 'r28', sourceId: wid('subscribe'), targetId: wid('root-scribe'), type: 'root-share', label: '词根' },
  // -gress
  { id: 'r29', sourceId: wid('progress'),   targetId: wid('root-gress'), type: 'root-share', label: '词根' },
  { id: 'r30', sourceId: wid('aggressive'), targetId: wid('root-gress'), type: 'root-share', label: '词根' },
  // -vene
  { id: 'r31', sourceId: wid('intervene'), targetId: wid('root-vene'), type: 'root-share', label: '词根' },
  { id: 'r32', sourceId: wid('prevent'),   targetId: wid('root-vene'), type: 'root-share', label: '词根' },

  // ── Word → Prefix (前缀) ──
  { id: 'p1', sourceId: wid('retain'),    targetId: wid('pref-re'),  type: 'prefix-share', label: '前缀' },
  { id: 'p2', sourceId: wid('respect'),   targetId: wid('pref-re'),  type: 'prefix-share', label: '前缀' },
  { id: 'p3', sourceId: wid('reduce'),    targetId: wid('pref-re'),  type: 'prefix-share', label: '前缀' },
  { id: 'p4', sourceId: wid('predict'),   targetId: wid('pref-pre'), type: 'prefix-share', label: '前缀' },
  { id: 'p5', sourceId: wid('prescribe'), targetId: wid('pref-pre'), type: 'prefix-share', label: '前缀' },
  { id: 'p6', sourceId: wid('prevent'),   targetId: wid('pref-pre'), type: 'prefix-share', label: '前缀' },
  { id: 'p7', sourceId: wid('prospect'),  targetId: wid('pref-pro'), type: 'prefix-share', label: '前缀' },
  { id: 'p8', sourceId: wid('produce'),   targetId: wid('pref-pro'), type: 'prefix-share', label: '前缀' },
  { id: 'p9', sourceId: wid('progress'),  targetId: wid('pref-pro'), type: 'prefix-share', label: '前缀' },
  { id: 'p10', sourceId: wid('contain'),   targetId: wid('pref-con'), type: 'prefix-share', label: '前缀' },
  { id: 'p11', sourceId: wid('conduct'),   targetId: wid('pref-con'), type: 'prefix-share', label: '前缀' },

  // ── Synonym (同义) ──
  { id: 's1', sourceId: wid('retain'),   targetId: wid('keep'),     type: 'synonym', label: '同义' },
  { id: 's2', sourceId: wid('retain'),   targetId: wid('maintain'), type: 'synonym', label: '同义' },
  { id: 's3', sourceId: wid('retain'),   targetId: wid('remember'), type: 'synonym', label: '同义(记)' },
  { id: 's4', sourceId: wid('retain'),   targetId: wid('employ'),   type: 'synonym', label: '同义(雇)' },
  { id: 's5', sourceId: wid('lucid'),    targetId: wid('clear'),    type: 'synonym', label: '同义' },
  { id: 's6', sourceId: wid('clear'),    targetId: wid('obvious'),  type: 'synonym', label: '同义' },
  { id: 's7', sourceId: wid('obvious'),  targetId: wid('apparent'), type: 'synonym', label: '同义' },
  { id: 's8', sourceId: wid('apparent'), targetId: wid('evident'),  type: 'synonym', label: '同义' },
  { id: 's9', sourceId: wid('evident'),  targetId: wid('explicit'), type: 'synonym', label: '同义' },

  // ── Antonym (反义) ──
  { id: 'a1', sourceId: wid('retain'),       targetId: wid('release'),     type: 'antonym', label: '反义' },
  { id: 'a2', sourceId: wid('remember'),     targetId: wid('forget'),      type: 'antonym', label: '反义' },
  { id: 'a3', sourceId: wid('optimistic'),   targetId: wid('pessimistic'), type: 'antonym', label: '反义' },
  { id: 'a4', sourceId: wid('include'),      targetId: wid('exclude'),     type: 'antonym', label: '反义' },

  // ── Derivative (词族) ──
  { id: 'd1', sourceId: wid('retain'),   targetId: wid('retention'), type: 'derivative', label: 'n.形式' },
];
