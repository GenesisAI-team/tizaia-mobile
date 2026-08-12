/**
 * Contrato común de los iconos internos compartidos (UI-000, issue #16).
 * Todos son decorativos (`accessible={false}`): el botón o fila que los
 * envuelve aporta la etiqueta accesible.
 */
export type IconProps = {
  size?: number;
  /** Color del trazo; cada icono define su color por defecto del tema. */
  color?: string;
};
