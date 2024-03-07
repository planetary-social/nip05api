{ inputs, ... }: {
  imports = [
   inputs.devshell.flakeModule
  ];

  perSystem = { config,pkgs, ...}: {
    devshells.default = {
      name = "nip05api-devshell";
      env = [
        {name = "NODE_ENV"; value = "development";}
        {name = "AUTH_PUBKEY"; value = "6c815df9b3e7f43492c232aba075b5fa5b6a60b731ce6ccfc7c1e8bd2adcceb2";}
        {name = "ROOT_DOMAIN"; value = "nos.social";}
        {name = "REDIS_HOST"; value = "localhost";}
      ];
      commands = [
        {
          name = "tt";
          help = "runs test suite in test environment";
          category = "app commands";
          command = ''NODE_ENV=test pnpm test'';
        }
        { package = config.packages.nodejs; category = "packages"; }
        { package = config.packages.pnpm; category = "packages"; }
        { package = pkgs.redis; category = "packages"; }
      ];
      serviceGroups.redis = {
        services.redis.command = "redis-server --loglevel notice";
      };
    };
  };
}