/* ==========================================================================
   blocks.js  -  Toolbox layout + custom block definitions
   Blockly 13 (UMD global: `Blockly`)
   Labels are ASCII-only to avoid any encoding issues across editors.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1) TOOLBOX
   Uses the JSON (category) toolbox format. Colour is a hue (0-360).
   -------------------------------------------------------------------------- */
const BLOCK_CATEGORIES = [
  {
    kind: 'category',
    name: 'Control',
    colour: '210',
    contents: [
      { kind: 'block', type: 'controls_if' },
      { kind: 'block', type: 'controls_whileUntil' },
      { kind: 'block', type: 'controls_for' },
    ],
  },
  {
    kind: 'category',
    name: 'Motion',
    colour: '150',
    contents: [
      { kind: 'block', type: 'robot_turn_left' },
      { kind: 'block', type: 'robot_turn_right' },
      { kind: 'block', type: 'robot_jump' },
    ],
  },
  {
    kind: 'category',
    name: 'Action',
    colour: '35',
    contents: [
      { kind: 'block', type: 'robot_dance' },
      { kind: 'block', type: 'robot_lay' },
      { kind: 'block', type: 'robot_lower_body' },
      { kind: 'block', type: 'robot_higher_body' },
      { kind: 'block', type: 'robot_scan_front' },
    ],
  },
  {
    kind: 'category',
    name: 'Variables',
    colour: '330',
    custom: 'VARIABLE', // built-in dynamic variable category
  },
  {
    kind: 'category',
    name: 'Math',
    colour: '260',
    contents: [{ kind: 'block', type: 'robot_math_calc' }],
  },
  {
    kind: 'category',
    name: 'Functions',
    colour: '290',
    custom: 'PROCEDURE', // built-in functions category
  },
];

/* --------------------------------------------------------------------------
   2) BUILT-IN BLOCKS
   IF / WHILE / FOR / MATH / VARIABLES / PROCEDURES come bundled inside
   blockly.min.js. Nothing extra is needed for those.
   -------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
   3) CUSTOM ROBOT BLOCKS
   Helper to build a simple "command" statement block.
   -------------------------------------------------------------------------- */
function defineCommandBlock(type, message, colour, tooltip) {
  Blockly.Blocks[type] = {
    init: function () {
      this.appendDummyInput().appendField(message);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(colour);
      if (tooltip) this.setTooltip(tooltip);
    },
  };
}

/* -- Turn left / right -- */
Blockly.Blocks['robot_turn_left'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('turn left')
      .appendField(new Blockly.FieldNumber(90, 0, 360, 1), 'DEGREES')
      .appendField('deg');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(150);
    this.setTooltip('Turn the robot to the left by the given degrees.');
  },
};

Blockly.Blocks['robot_turn_right'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('turn right')
      .appendField(new Blockly.FieldNumber(90, 0, 360, 1), 'DEGREES')
      .appendField('deg');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(150);
    this.setTooltip('Turn the robot to the right by the given degrees.');
  },
};

/* -- Jump -- */
Blockly.Blocks['robot_jump'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('jump')
      .appendField(new Blockly.FieldNumber(1, 0, null, 1), 'HEIGHT')
      .appendField('level(s)');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(150);
    this.setTooltip('Make the robot jump a number of levels high.');
  },
};

/* -- Dance / Lay -- */
defineCommandBlock('robot_dance', 'dance', 35, 'Make the robot do a little dance.');
defineCommandBlock('robot_lay', 'lay down', 35, 'Make the robot lie down.');

/* -- Lower / Higher body -- */
Blockly.Blocks['robot_lower_body'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('lower body')
      .appendField(new Blockly.FieldNumber(10, 0, null, 1), 'AMOUNT')
      .appendField('cm');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(35);
    this.setTooltip('Lower the robot body by the given amount.');
  },
};

Blockly.Blocks['robot_higher_body'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('higher body')
      .appendField(new Blockly.FieldNumber(10, 0, null, 1), 'AMOUNT')
      .appendField('cm');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(35);
    this.setTooltip('Raise the robot body by the given amount.');
  },
};

/* -- Scan front (value block returning a reading) -- */
Blockly.Blocks['robot_scan_front'] = {
  init: function () {
    this.appendDummyInput().appendField('scan front');
    this.setOutput(true, null);
    this.setColour(35);
    this.setTooltip('Read the distance to an obstacle in front of the robot.');
  },
};

/* -- Set variable (friendly dedicated version) -- */
Blockly.Blocks['robot_set_variable'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('set')
      .appendField(new Blockly.FieldVariable('myVar'), 'VAR')
      .appendField('to');
    this.appendValueInput('VALUE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip('Assign a value to a variable.');
  },
};

/* -- Basic calculation (value block) -- */
Blockly.Blocks['robot_math_calc'] = {
  init: function () {
    this.appendValueInput('A').setCheck('Number').appendField('calc');
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ['+', 'ADD'],
          ['-', 'MINUS'],
          ['*', 'MULTIPLY'],
          ['/', 'DIVIDE'],
          ['%', 'MODULO'],
        ]),
        'OP'
      );
    this.appendValueInput('B').setCheck('Number');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(260);
    this.setTooltip('Perform a basic calculation between two numbers.');
  },
};

/* --------------------------------------------------------------------------
   4) BUILD TOOLBOX
   -------------------------------------------------------------------------- */
function buildToolbox() {
  return { kind: 'categoryToolbox', contents: BLOCK_CATEGORIES };
}
