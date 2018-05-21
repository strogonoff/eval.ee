Jekyll::Hooks.register :site, :after_init do |site|
  unless (File.file?("package.json") and File.directory?("node_modules"))
    p "-- Eva: Initializing Node package…"

    system("npm init --yes")
    system("npm install webpack-cli webpack jquery")
  end

  if site.theme
    # If site.theme is empty, we’re in theme development mode
    # and no need to copy

    webpack_config = File.join(site.theme.root, 'webpack.config.js')
    app = File.join(site.theme.root, 'app')

    unless File.file?('webpack.config.js')
      FileUtils.copy_entry(webpack_config, File.join(site.source, 'webpack.config.js'))
    end
    unless File.directory?('app')
      FileUtils.copy_entry(app, File.join(site.source, 'app'))
    end
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  p "-- Eva: Building assets with Webpack…"

  out_assets_dir = File.join(site.config["destination"], 'assets')
  system("npx webpack --output-path #{out_assets_dir}")

  p "-- Eva: Build complete"
end
