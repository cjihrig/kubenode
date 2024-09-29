type CustomType = {
  prop1: boolean;
};

type AliasedType = CustomType;

/**
 * @kubenode
 * @apiVersion supported.io/v1
 */
type SupportedTypes = {
  prop1: string;
  prop2: number;
  prop3: boolean;
  prop4: object;
  prop5: string[];
  prop6: 'a-string';
  prop7: true;
  prop8: false;
  prop9: 100;
  prop10: { subprop: string; };
  prop11: CustomType;
  prop12: AliasedType;
  prop13: CustomType[];
  prop14: AliasedType[];
  prop15: Date;
};
