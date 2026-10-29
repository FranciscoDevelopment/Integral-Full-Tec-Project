// A selectable value plus the Spanish label shown in the UI.
export interface Option<TValue extends string = string> {
  value: TValue;
  label: string;
}
