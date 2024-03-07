{
  perSystem = { pkgs, system, ... }: {
    packages.nodejs = pkgs.nodejs_18;
    packages.pnpm = pkgs.nodePackages.pnpm;
  };
}