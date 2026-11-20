/* ==========================================================================
   blocks.js  -  Toolbox layout + custom block definitions
   Blockly 13 (UMD global: `Blockly`)
   Labels are ASCII-only to avoid any encoding issues across editors.
   ========================================================================== */

/* --------------------------------------------------------------------------
   0) DEFAULT DATA ARRAYS (size 15 each)
   Ship two ready-made arrays so the array / recognize blocks have data.
   -------------------------------------------------------------------------- */
const DEFAULT_BUILDINGS = [
  'Empire Tower', 'Sunset Plaza', 'Maple Court', 'Harbor View',
  'Kingsbridge', 'Riverside Loft', 'Cedar Heights', 'Silver Dome',
  'Grand Central', 'Pine Valley', 'Orchid Hall', 'Union Square',
  'Lighthouse Point', 'Willow Creek', 'Crystal Bay',
];

const DEFAULT_PEOPLE = [
  'Alice Johnson', 'Ben Carter', 'Chloe Nguyen', 'David Kim',
  'Emma Wilson', 'Frank Miller', 'Grace Lee', 'Henry Adams',
  'Isabella Rossi', 'Jack Thompson', 'Karen White', 'Liam Brown',
  'Mia Davis', 'Noah Garcia', 'Olivia Martinez',
];

/* --------------------------------------------------------------------------
   1) TOOLBOX
   Uses the JSON (category) toolbox format. Colour is a hue (0-360).
   Category label text is forced to black via `cssConfig` + style.css.
   -------------------------------------------------------------------------- */
const BLOCK_CATEGORIES = [
  {
    kind: 'category',
    name: 'Control',
    colour: '210',
        cssConfig: { container: 'cat-control' },
    contents: [
      { kind: 'block', type: 'robot_start' },
      { kind: 'block', type: 'controls_if' },
      { kind: 'block', type: 'controls_whileUntil' },
      { kind: 'block', type: 'controls_for' },
    ],
  },
  {
    kind: 'category',
    name: 'Motion',
    colour: '150',
    cssConfig: { container: 'cat-motion' },
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
    cssConfig: { container: 'cat-action' },
    contents: [
      { kind: 'block', type: 'robot_dance' },
      { kind: 'block', type: 'robot_lay' },
      { kind: 'block', type: 'robot_sit_down' },
            { kind: 'block', type: 'robot_lower_body' },
            { kind: 'block', type: 'robot_higher_body' },
            { kind: 'block', type: 'robot_stop' },
            { kind: 'block', type: 'robot_load' },
            { kind: 'block', type: 'robot_unload' },
            { kind: 'block', type: 'robot_speak' },
            { kind: 'block', type: 'robot_walk_forward' },
            { kind: 'block', type: 'robot_scan_front' },
    ],
  },
    {
    kind: 'category',
    name: 'Variables',
    colour: '330',
    cssConfig: { container: 'cat-variables' },
    // Built dynamically (see variablesCategoryFlyout) so we can add a
    // "Create variable" button AND clearly list the preset arrays.
    custom: 'VARIABLES_PRESETS',
  },
  {
    kind: 'category',
    name: 'Math',
    colour: '260',
    cssConfig: { container: 'cat-math' },
        contents: [
      { kind: 'block', type: 'robot_math_calc' },
      { kind: 'block', type: 'robot_math_compare' },
      { kind: 'block', type: 'robot_math_round' },
      { kind: 'block', type: 'robot_math_power' },
      { kind: 'block', type: 'robot_math_minmax' },
      { kind: 'block', type: 'robot_math_random' },
      { kind: 'block', type: 'robot_math_constrain' },
      { kind: 'block', type: 'robot_math_remainder' },
      { kind: 'block', type: 'math_number' },
      { kind: 'block', type: 'math_arithmetic' },
    ],
  },
  {
    kind: 'category',
    name: 'Functions',
    colour: '290',
    cssConfig: { container: 'cat-functions' },
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

/* -- Start block (program entry point) --
   A "hat" block with no previous connection: it marks the top of the main
   program. Everything below it is what runs when the program starts. */
Blockly.Blocks['robot_start'] = {
  init: function () {
    this.appendDummyInput().appendField('start');
        this.setNextStatement(true, null);
    this.setColour(120);
    this.hat = true; // rounded "teeth"/hat so it reads as an entry point
    this.setTooltip('The program starts here. Attach your main program below.');
    this.setDeletable(true);
    this.setMovable(true);
  },
};

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

/* -- Dance / Lay / Sit down -- */
defineCommandBlock('robot_dance', 'dance', 35, 'Make the robot do a little dance.');
defineCommandBlock('robot_lay', 'lay down', 35, 'Make the robot lie down.');
defineCommandBlock('robot_sit_down', 'sit down', 35, 'Make the robot sit down.');

/* -- Stop / Load / Unload -- */
defineCommandBlock('robot_stop', 'stop', 35, 'Stop the robot immediately.');

/* Load: load cargo/object onto the robot. Optional text describing what. */
Blockly.Blocks['robot_load'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('load')
      .appendField(new Blockly.FieldTextInput('cargo'), 'WHAT');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(35);
    this.setTooltip('Load an object/cargo onto the robot.');
  },
};

/* Unload: unload cargo/object from the robot. */
Blockly.Blocks['robot_unload'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('unload')
      .appendField(new Blockly.FieldTextInput('cargo'), 'WHAT');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(35);
    this.setTooltip('Unload an object/cargo from the robot.');
  },
};

/* Speak: say the given content. Uses a direct string input field so the user
   can type the text straight into the block. */
Blockly.Blocks['robot_speak'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('speak')
      .appendField(new Blockly.FieldTextInput('Hello'), 'CONTENT');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(35);
    this.setTooltip('Make the robot speak the given text.');
  },
};

/* Walk forward: walk forward by an amount given as a string (e.g. "3 steps",
   "2 meters"). Uses a direct string input field. */
Blockly.Blocks['robot_walk_forward'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('walk forward')
      .appendField(new Blockly.FieldTextInput('1 step'), 'DISTANCE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(35);
    this.setTooltip('Walk the robot forward by the given amount (text).');
  },
};

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

/* -- Recognize block --
   Lets the user pick WHAT to recognize (dropdown), then stores the
   recognized item into a variable "slot". A statement block so it can sit
   inline in the main program. -- */
Blockly.Blocks['robot_scan_front'] = {
  init: function () {
    this.appendDummyInput('ROW_HEAD')
      .appendField('recognize')
      .appendField(
        new Blockly.FieldDropdown([
          ['building', 'BUILDING'],
          ['person', 'PERSON'],
          ['face', 'FACE'],
          ['sign', 'SIGN'],
          ['color', 'COLOR'],
          ['text', 'TEXT'],
          ['number', 'NUMBER'],
          ['obstacle', 'OBSTACLE'],
        ], function (value) {
          // Keep the stored-variable type hint in sync with the selection.
          return value;
        }),
        'TYPE'
      )
      .appendField('in front');
    this.appendDummyInput('ROW_STORE')
      .appendField('store in')
      .appendField(new Blockly.FieldVariable('recognized'), 'VAR');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(35);
    this.setTooltip(
      'Recognize the chosen type of object in front of the robot and store the recognized item in a variable.'
    );
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
   3b) EXTRA MATH BLOCKS
   -------------------------------------------------------------------------- */

/* Round a number (round / floor / ceil / abs). */
Blockly.Blocks['robot_math_round'] = {
  init: function () {
    this.appendValueInput('NUM').setCheck('Number').appendField('round');
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ['round', 'ROUND'],
        ['floor', 'FLOOR'],
        ['ceil', 'CEIL'],
        ['abs', 'ABS'],
      ]),
      'MODE'
    );
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(260);
    this.setTooltip('Round, floor, ceil, or take the absolute value of a number.');
  },
};

/* Power: (a ^ b). */
Blockly.Blocks['robot_math_power'] = {
  init: function () {
    this.appendValueInput('A').setCheck('Number').appendField('power');
    this.appendValueInput('B').setCheck('Number').appendField('^');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(260);
    this.setTooltip('Raise a number to the power of another.');
  },
};

/* Min / max of two numbers. */
Blockly.Blocks['robot_math_minmax'] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ['min', 'MIN'],
        ['max', 'MAX'],
      ]),
      'MODE'
    );
    this.appendValueInput('A').setCheck('Number').appendField('of');
    this.appendValueInput('B').setCheck('Number').appendField('and');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(260);
    this.setTooltip('Return the smaller (min) or larger (max) of two numbers.');
  },
};

/* Random integer between two bounds. */
Blockly.Blocks['robot_math_random'] = {
  init: function () {
    this.appendValueInput('FROM').setCheck('Number').appendField('random from');
    this.appendValueInput('TO').setCheck('Number').appendField('to');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(260);
    this.setTooltip('Return a random integer between two bounds (inclusive).');
  },
};

/* Constrain a value into a range. */
Blockly.Blocks['robot_math_constrain'] = {
  init: function () {
    this.appendValueInput('VALUE').setCheck('Number').appendField('constrain');
    this.appendValueInput('LOW').setCheck('Number').appendField('between');
    this.appendValueInput('HIGH').setCheck('Number').appendField('and');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(260);
    this.setTooltip('Clamp a value so it stays within a low and high range.');
  },
};

/* Compare two values. Operators: =, !=, <, <=, >, >=  (the '=' equality
   operator requested for the Math category). Outputs a Boolean. */
Blockly.Blocks['robot_math_compare'] = {
  init: function () {
    this.appendValueInput('A').appendField('compare');
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ['=', 'EQ'],
        ['≠', 'NEQ'],
        ['<', 'LT'],
        ['≤', 'LTE'],
        ['>', 'GT'],
        ['≥', 'GTE'],
      ]),
      'OP'
    );
    this.appendValueInput('B');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setColour(260);
    this.setTooltip('Compare two values and return true or false.');
  },
};

/* Remainder / modulo of two numbers. */
Blockly.Blocks['robot_math_remainder'] = {
  init: function () {
    this.appendValueInput('A').setCheck('Number').appendField('remainder of');
    this.appendValueInput('B').setCheck('Number').appendField('divided by');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(260);
    this.setTooltip('Return the remainder after dividing one number by another.');
  },
};

/* --------------------------------------------------------------------------
   3c) ARRAY BLOCKS (Variables category)
   -------------------------------------------------------------------------- */

/* Create an array - either empty, from a preset list, or with N repeated
   values. Stored into a variable. The two default lists have 15 items. */
Blockly.Blocks['robot_array_create'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('create array')
      .appendField(new Blockly.FieldVariable('myArray'), 'VAR')
      .appendField('=')
      .appendField(
        new Blockly.FieldDropdown([
          ['empty', 'EMPTY'],
          ['buildings (default 15)', 'BUILDINGS'],
          ['people (default 15)', 'PEOPLE'],
          ['[value] x count', 'FILLED'],
        ]),
        'MODE'
      );
    this.appendDummyInput('FILL_ROW')
      .appendField('with')
      .appendField(new Blockly.FieldTextInput('item'), 'VALUE')
      .appendField('count')
      .appendField(new Blockly.FieldNumber(15, 1, null, 1), 'COUNT');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip(
      'Create an array variable. Use a built-in 15-item list, or fill with a repeated value.'
    );

    // Only show the fill row when "fill with value" is selected.
    const self = this;
    const dropdown = this.getField('MODE');
        const updateFillVisibility = function () {
      const filled = self.getFieldValue('MODE') === 'FILLED';
      // Hide/show the whole "with ... count ..." row.
      const row = self.getInput('FILL_ROW');
      if (row) {
        row.setVisible(filled);
      }
      self.render && self.render();
    };
    dropdown.setValidator(function (newValue) {
      setTimeout(updateFillVisibility, 0);
      return newValue;
    });
    // Initial visibility after the block is fully built.
    setTimeout(updateFillVisibility, 0);
  },
};

/* Add an item to the end of an array. */
Blockly.Blocks['robot_array_add'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('add')
      .appendField(new Blockly.FieldVariable('myArray'), 'VAR')
      .appendField('item');
    this.appendValueInput('ITEM');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip('Append an item to the end of an array.');
  },
};

/* Get the item at an index. The index is a value input (not a fixed number)
   so a variable - e.g. a loop counter - can be dropped into it. */
Blockly.Blocks['robot_array_get'] = {
  init: function () {
    this.appendDummyInput().appendField('item');
    this.appendValueInput('INDEX')
      .setCheck('Number')
      .appendField('at')
      .appendField(new Blockly.FieldNumber(0, 0, null, 1)); // shadow value
    this.appendDummyInput()
      .appendField('of')
      .appendField(new Blockly.FieldVariable('myArray'), 'VAR');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(330);
    this.setTooltip('Get the item at a given index of an array. Drop a variable into the index.');
  },
};

/* Length of an array. */
Blockly.Blocks['robot_array_length'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('length of')
      .appendField(new Blockly.FieldVariable('myArray'), 'VAR');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(330);
    this.setTooltip('Get the number of items in an array.');
  },
};

/* Delete an item by index. */
Blockly.Blocks['robot_array_delete'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('delete item')
      .appendField(new Blockly.FieldNumber(0, 0, null, 1), 'INDEX')
      .appendField('from')
      .appendField(new Blockly.FieldVariable('myArray'), 'VAR');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip('Delete the item at a given index from an array.');
  },
};

/* Find index of a value. */
Blockly.Blocks['robot_array_find'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('find')
      .appendField(new Blockly.FieldVariable('myArray'), 'VAR')
      .appendField('value');
    this.appendValueInput('VALUE');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(330);
    this.setTooltip('Find the index of a value in an array (-1 if not found).');
  },
};

/* Sort an array (ascending / descending / reverse). */
Blockly.Blocks['robot_array_sort'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('sort')
      .appendField(new Blockly.FieldVariable('myArray'), 'VAR')
      .appendField(
        new Blockly.FieldDropdown([
          ['ascending', 'ASC'],
          ['descending', 'DESC'],
          ['reverse', 'REVERSE'],
        ]),
        'MODE'
      );
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip('Sort or reverse an array in place.');
  },
};

/* --------------------------------------------------------------------------
   3c-2) PRESET ARRAY BLOCKS (visible in the Variables tab)
   These expose the two built-in 15-item arrays directly, so the user can
   see and drop them without hunting through a dropdown.
   -------------------------------------------------------------------------- */

/* Preset array: buildings (15 items). */
Blockly.Blocks['robot_array_buildings'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('buildings preset (15) ->')
      .appendField(new Blockly.FieldVariable('buildings'), 'VAR');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip('Load the 15-item building-name list into a variable.');
  },
};

/* Preset array: people (15 items). */
Blockly.Blocks['robot_array_people'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('people preset (15) ->')
      .appendField(new Blockly.FieldVariable('people'), 'VAR');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip('Load the 15-item people-name list into a variable.');
  },
};

/* --------------------------------------------------------------------------
   3d) GIVE DEFINED-FUNCTION BLOCKS A HAT ("teeth")
   The built-in procedure definition block normally has no hat, so it looked
   like an ordinary stackable block. We wrap its init() to add setHat(true),
   giving it the rounded top so it stands clearly as a top-level definition
   that can still be dragged into / placed within the main program.
   -------------------------------------------------------------------------- */
['procedures_defnoreturn', 'procedures_defreturn'].forEach(function (type) {
  var orig = Blockly.Blocks[type];
  if (!orig || typeof orig.init !== 'function') return;
  var originalInit = orig.init;
  Blockly.Blocks[type] = Object.assign({}, orig, {
        init: function () {
      originalInit.call(this);
      this.hat = true; // give the definition a rounded hat ("teeth") on top
    },
  });
});

/* --------------------------------------------------------------------------
   4) BUILD TOOLBOX
   -------------------------------------------------------------------------- */

/* Register the custom "VARIABLES_PRESETS" category. Its flyout contains a
   "Create variable" button (so users can define new variables), then the
   variable blocks, then the two visible preset-array blocks. */
function variablesCategoryFlyout(targetWorkspace) {
  // 1) A button that opens the variable-creation prompt.
  var createVarButton = {
    kind: 'button',
    text: '+ Create variable',
    callbackkey: 'CREATE_VARIABLE',
  };

  // 2) Variable + array blocks (including the visible presets).
  var blocks = [
    'robot_set_variable',
    'variables_get',
    'variables_set',
    'robot_array_create',
    'robot_array_buildings',
    'robot_array_people',
    'robot_array_add',
    'robot_array_get',
    'robot_array_length',
    'robot_array_delete',
    'robot_array_find',
    'robot_array_sort',
  ].map(function (type) {
    return { kind: 'block', type: type };
  });

  return { kind: 'categoryToolbox', contents: [createVarButton].concat(blocks) };
}

// Wire the "Create variable" button to Blockly's variable creation dialog.
function registerVariableCategory(workspace) {
  workspace.registerButtonCallback('CREATE_VARIABLE', function (button) {
    Blockly.Variables.createVariableButtonHandler(
      button.getTargetWorkspace(),
      null,
      ''
    );
  });
}

function buildToolbox() {
  return { kind: 'categoryToolbox', contents: BLOCK_CATEGORIES };
}
