const tags = [
  'linux', 'git', 'curl', 'nginx', 'postgresql', 'sqlite', 'redis',
  'memcached', 'openssh', 'openssl', 'ffmpeg', 'vim', 'neovim',
  'emacs', 'tmux', 'zsh', 'bash', 'coreutils', 'systemd', 'docker',
  'podman', 'kubernetes', 'containerd', 'runc', 'traefik',
  'haproxy', 'envoy', 'caddy', 'vault', 'consul',
  'etcd', 'prometheus', 'grafana', 'thanos', 'loki', 'jaeger',
  'rust', 'clang', 'llvm', 'gcc', 'make', 'cmake', 'ninja',
  'libressl', 'polars', 'duckdb', 'clickhouse',
  'zstd', 'lz4', 'rsync', 'wireshark',
  'varnish', 'squid', 'openvpn', 'wireguard',
  'libvirt', 'qemu', 'wayland',
  'mesa', 'pipewire', 'bluez',
  'nftables', 'iptables',
  'busybox', 'alpine', 'nixos',
  'debian', 'arch', 'gentoo',
];

export function GET() {
  return new Response(JSON.stringify(tags), {
    headers: { 'content-type': 'application/json' },
  });
}
