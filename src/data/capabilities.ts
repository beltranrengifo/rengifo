export interface CapabilityColumn {
  headingKey: string;
  itemKeys: string[];
}

export const capabilities: CapabilityColumn[] = [
  {
    headingKey: 'cap_h_backend',
    itemKeys: [
      'cap_be_1',
      'cap_be_2',
      'cap_be_3',
      'cap_be_4',
      'cap_be_5',
      'cap_be_6',
    ],
  },
  {
    headingKey: 'cap_h_frontend',
    itemKeys: [
      'cap_fe_1',
      'cap_fe_2',
      'cap_fe_3',
      'cap_fe_4',
      'cap_fe_5',
      'cap_fe_6',
    ],
  },
  {
    headingKey: 'cap_h_infra',
    itemKeys: ['cap_infra_1', 'cap_infra_2', 'cap_infra_3', 'cap_infra_4'],
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
