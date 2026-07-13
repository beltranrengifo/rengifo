export interface CapabilityColumn {
  headingKey: string;
  itemKeys: string[];
}

export const capabilities: CapabilityColumn[] = [
  {
    headingKey: 'cap_h_frontend',
    itemKeys: [
      'cap_fe_1',
      'cap_fe_2',
      'cap_fe_3',
      'cap_fe_6',
      'cap_fe_4',
      'cap_fe_5',
    ],
  },
  {
    headingKey: 'cap_h_stack',
    itemKeys: [
      'cap_stack_1',
      'cap_stack_5',
      'cap_stack_2',
      'cap_stack_3',
      'cap_stack_6',
      'cap_stack_4',
    ],
  },
  {
    headingKey: 'cap_h_uiux',
    itemKeys: ['cap_uiux_1', 'cap_uiux_2', 'cap_uiux_3', 'cap_uiux_4'],
  },
  {
    headingKey: 'cap_h_practice',
    itemKeys: [
      'cap_practice_1',
      'cap_practice_2',
      'cap_practice_3',
      'cap_practice_4',
      'cap_practice_5',
    ],
  },
];
