/* ==========================================================================
   generators.js
   Two "views" of the same program:
     1) JavaScript     - a JS-flavoured generator for our blocks
     2) Robot Commands - a custom, readable pseudo-code generator
   ========================================================================== */

/* ORDER constants (operator precedence) vary across Blockly versions.
   Blockly 11+ moved them into an `Order` enum. Resolve safe fallbacks. */
var ORDER = {
  ATOMIC: (Blockly.Order && Blockly.Order.ATOMIC) || 0,
  ASSIGNMENT: (Blockly.Order && Blockly.Order.ASSIGNMENT) || 1,
  NONE: (Blockly.Order && Blockly.Order.NONE) || 99,
};

/* Resolve a variable's display name without the generator name database. */
function variableName(block, fieldName) {
  var id = block.getFieldValue(fieldName);
  var ws = block.workspace;
  if (ws && ws.getVariableMap) {
    var m = ws.getVariableMap().getVariableById(id);
    if (m && m.name) return m.name;
  }
  if (ws && ws.getVariableById) {
    var v = ws.getVariableById(id);
    if (v && v.name) return v.name;
  }
  return 'variable';
}

/* ==========================================================================
   A) JAVASCRIPT GENERATOR
   ========================================================================== */
var jsGen = (typeof Blockly !== 'undefined' && Blockly.JavaScript) ? Blockly.JavaScript : new Blockly.Generator('JavaScript');
jsGen.addReservedWords('robot');
jsGen.INDENT = '  ';

jsGen.forBlock['robot_turn_left'] = function (block) {
  return 'robot.turnLeft(' + block.getFieldValue('DEGREES') + ');\n';
};
jsGen.forBlock['robot_turn_right'] = function (block) {
  return 'robot.turnRight(' + block.getFieldValue('DEGREES') + ');\n';
};
jsGen.forBlock['robot_jump'] = function (block) {
  return 'robot.jump(' + block.getFieldValue('HEIGHT') + ');\n';
};
jsGen.forBlock['robot_dance'] = function () {
  return 'robot.dance();\n';
};
jsGen.forBlock['robot_lay'] = function () {
  return 'robot.lay();\n';
};
jsGen.forBlock['robot_lower_body'] = function (block) {
  return 'robot.lowerBody(' + block.getFieldValue('AMOUNT') + ');\n';
};
jsGen.forBlock['robot_higher_body'] = function (block) {
  return 'robot.higherBody(' + block.getFieldValue('AMOUNT') + ');\n';
};
jsGen.forBlock['robot_scan_front'] = function () {
  return ['robot.scanFront()', ORDER.ATOMIC];
};
jsGen.forBlock['robot_set_variable'] = function (block, generator) {
  var name = variableName(block, 'VAR');
  var value = generator.valueToCode(block, 'VALUE', ORDER.ASSIGNMENT) || '0';
  return name + ' = ' + value + ';\n';
};
jsGen.forBlock['robot_math_calc'] = function (block, generator) {
  var a = generator.valueToCode(block, 'A', ORDER.ATOMIC) || '0';
  var b = generator.valueToCode(block, 'B', ORDER.ATOMIC) || '0';
  var op = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/', MODULO: '%' }[block.getFieldValue('OP')];
  return ['(' + a + ' ' + op + ' ' + b + ')', ORDER.ATOMIC];
};

/* ==========================================================================
   B) ROBOT COMMANDS GENERATOR (custom, readable pseudo-code)
   ========================================================================== */
var robotGen = new Blockly.Generator('Robot');
robotGen.INDENT = '  ';

robotGen.scrub_ = function (block, code, thisOnly) {
  var next = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = next && !thisOnly ? robotGen.blockToCode(next) : '';
  return code ? code + nextCode : nextCode;
};

robotGen.forBlock['robot_turn_left'] = function (b) {
  return 'TURN LEFT ' + b.getFieldValue('DEGREES') + 'deg\n';
};
robotGen.forBlock['robot_turn_right'] = function (b) {
  return 'TURN RIGHT ' + b.getFieldValue('DEGREES') + 'deg\n';
};
robotGen.forBlock['robot_jump'] = function (b) {
  return 'JUMP ' + b.getFieldValue('HEIGHT') + ' level(s)\n';
};
robotGen.forBlock['robot_dance'] = function () { return 'DANCE\n'; };
robotGen.forBlock['robot_lay'] = function () { return 'LAY DOWN\n'; };
robotGen.forBlock['robot_lower_body'] = function (b) {
  return 'LOWER BODY ' + b.getFieldValue('AMOUNT') + 'cm\n';
};
robotGen.forBlock['robot_higher_body'] = function (b) {
  return 'RAISE BODY ' + b.getFieldValue('AMOUNT') + 'cm\n';
};
robotGen.forBlock['robot_scan_front'] = function () {
  return ['SCAN_FRONT', ORDER.ATOMIC];
};
robotGen.forBlock['robot_set_variable'] = function (b, g) {
  var name = variableName(b, 'VAR');
  var val = g.valueToCode(b, 'VALUE', ORDER.ASSIGNMENT) || '0';
  return name + ' = ' + val + '\n';
};
robotGen.forBlock['robot_math_calc'] = function (b, g) {
  var a = g.valueToCode(b, 'A', ORDER.ATOMIC) || '0';
  var c = g.valueToCode(b, 'B', ORDER.ATOMIC) || '0';
  var op = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/', MODULO: '%' }[b.getFieldValue('OP')];
  return ['(' + a + ' ' + op + ' ' + c + ')', ORDER.ATOMIC];
};

/* Common built-in value blocks. */
robotGen.forBlock['math_number'] = function (b) {
  return [String(b.getFieldValue('NUM')), ORDER.ATOMIC];
};
robotGen.forBlock['math_arithmetic'] = function (b, g) {
  var OP = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/', POWER: '^' };
  var a = g.valueToCode(b, 'A', ORDER.ATOMIC) || '0';
  var c = g.valueToCode(b, 'B', ORDER.ATOMIC) || '0';
  return ['(' + a + ' ' + (OP[b.getFieldValue('OP')] || '?') + ' ' + c + ')', ORDER.ATOMIC];
};
robotGen.forBlock['variables_get'] = function (b) {
  return [variableName(b, 'VAR'), ORDER.ATOMIC];
};
robotGen.forBlock['text'] = function (b) {
  return ['"' + b.getFieldValue('TEXT') + '"', ORDER.ATOMIC];
};
robotGen.forBlock['logic_boolean'] = function (b) {
  return [b.getFieldValue('BOOL') === 'TRUE' ? 'TRUE' : 'FALSE', ORDER.ATOMIC];
};
robotGen.forBlock['logic_compare'] = function (b, g) {
  var OP = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' };
  var a = g.valueToCode(b, 'A', ORDER.ATOMIC) || '0';
  var c = g.valueToCode(b, 'B', ORDER.ATOMIC) || '0';
  return ['(' + a + ' ' + (OP[b.getFieldValue('OP')] || '?') + ' ' + c + ')', ORDER.ATOMIC];
};

/* Built-in control-flow blocks: pretty pseudo-code for the Robot view so the
   output reads clearly instead of leaning on the generic fallback. */
robotGen.forBlock['controls_if'] = function (b, g) {
  var n = 0, out = '';
  do {
    var cond = g.valueToCode(b, 'IF' + n, ORDER.NONE) || 'TRUE';
    var branch = g.statementToCode(b, 'DO' + n) || '';
    var inner = g.prefixLines ? g.prefixLines(branch, g.INDENT) : branch;
    out += (n === 0 ? '' : 'else ') + 'if ' + cond + ' {\n' + inner + '}\n';
    n++;
  } while (b.getInput('IF' + n));
  if (b.getInput('ELSE')) {
    var elseBranch = g.statementToCode(b, 'ELSE') || '';
    var elseInner = g.prefixLines ? g.prefixLines(elseBranch, g.INDENT) : elseBranch;
    out += 'else {\n' + elseInner + '}\n';
  }
  return out;
};

robotGen.forBlock['controls_whileUntil'] = function (b, g) {
  var mode = b.getFieldValue('MODE') === 'UNTIL' ? 'until' : 'while';
  var cond = g.valueToCode(b, 'BOOL', ORDER.NONE) || 'TRUE';
  var branch = g.statementToCode(b, 'DO') || '';
  var inner = g.prefixLines ? g.prefixLines(branch, g.INDENT) : branch;
  return mode + ' ' + cond + ' {\n' + inner + '}\n';
};

robotGen.forBlock['controls_for'] = function (b, g) {
  var v = variableName(b, 'VAR');
  var from = g.valueToCode(b, 'FROM', ORDER.NONE) || '0';
  var to = toCodeSafe(g, b, 'TO') || '0';
  var by = toCodeSafe(g, b, 'BY') || '1';
  var branch = g.statementToCode(b, 'DO') || '';
  var inner = g.prefixLines ? g.prefixLines(branch, g.INDENT) : branch;
  return 'for ' + v + ' = ' + from + ' to ' + to + ' by ' + by + ' {\n' + inner + '}\n';
};

function toCodeSafe(g, b, input) {
  try {
    if (b.getInput(input)) return g.valueToCode(b, input, ORDER.NONE);
  } catch (e) {}
  return '';
}

robotGen.forBlock['variables_set'] = function (b, g) {
  var name = variableName(b, 'VAR');
  var val = g.valueToCode(b, 'VALUE', ORDER.ASSIGNMENT) || '0';
  return name + ' = ' + val + '\n';
};
/* Fallback for unknown block types (built-in if/while/for, etc.) so the
   visualization view never throws - it emits a readable placeholder. */
robotGen.fallbackForBlock = function (block, generator) {
  var parts = [];
  var inputs = block.inputList || [];
  for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    var fields = input.fieldRow || [];
    for (var j = 0; j < fields.length; j++) {
      var v = null;
      try { v = fields[j].getValue && fields[j].getValue(); } catch (e) { v = null; }
      if (v != null && v !== '') parts.push(String(v));
    }
    if (input.connection && input.connection.targetBlock()) {
      var code = generator.valueToCode(block, input.name, ORDER.NONE);
      if (code) parts.push(code);
    }
  }
  var label = (block.type || 'block').replace(/^.*_/, '');
  var line = parts.length ? (label + ' ' + parts.join(' ')) : label;
  if (block.outputConnection) return [line, ORDER.NONE];
  return line + '\n';
};

var rawBlockToCode = robotGen.blockToCode.bind(robotGen);
robotGen.blockToCode = function (block, opt_thisOnly) {
  if (!block) return '';
  var known = robotGen.forBlock && typeof robotGen.forBlock[block.type] === 'function';
  if (known) return rawBlockToCode(block, opt_thisOnly);
  var own = robotGen.fallbackForBlock(block, robotGen);
  if (block.outputConnection) return own;
  return robotGen.scrub_(block, Array.isArray(own) ? own[0] : own, opt_thisOnly);
};

/* ==========================================================================
   C) LANGUAGE SELECTION + RENDERING HELPERS
   ========================================================================== */
var GENERATORS = {
  js: {
    gen: jsGen,
    wrap: function (body) { return '// Generated by BlockCraft\n' + (body || '// (empty program)\n'); }
  },
  robot: {
    gen: robotGen,
    wrap: function (body) { return (body && body.trim()) ? body : '// (empty program)\n'; }
  }
};

function workspaceToCode(workspace, lang) {
  var entry = GENERATORS[lang] || GENERATORS.js;
  var body = '';
  try {
    body = entry.gen.workspaceToCode(workspace);
  } catch (e) {
    body = '// Error generating code: ' + e.message + '\n';
  }
  return entry.wrap(body);
}