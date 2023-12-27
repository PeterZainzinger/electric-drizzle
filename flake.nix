{
  description = "A basic flake with a shell";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/release-23.11";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let

        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };

        setupScript = "";
        nodePkg = pkgs.nodejs;
      in {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodePkg
            (yarn.override { nodejs = nodePkg; })
          ];
          shellHook = setupScript;
        };
      });
}
