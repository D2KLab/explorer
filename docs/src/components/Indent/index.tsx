import React, { type ComponentProps, type ReactElement } from 'react';
import styles from './styles.module.css';

interface Props {
  readonly children: ReactElement<ComponentProps<'div'>>;
}

export default function Indent({ children }: Props): JSX.Element {
  return <div className={styles.indent}>{children}</div>;
}
