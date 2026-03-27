export function Icon({
  height = "16px",
  viewBox = "0 -960 960 960",
  width = "16px",
  fill = "currentColor",
  className = "text-gray-600",
  ...rest
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      height={height}
      viewBox={viewBox}
      width={width}
      fill={fill}
      className={className}
      {...rest}
    ></svg>
  );
}
