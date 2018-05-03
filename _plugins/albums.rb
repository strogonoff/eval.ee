IMAGE_EXTS = ['.svg', '.png', '.jpg', '.jpeg']

def get_album_source_path(album_name)
    # Relative to Jekyll’s data dir
    return File.join("albums", album_name)
end

def get_album_symbol_filename()
    return "symbol.png"
end

def get_album_static_dest_path(album_name)
    # Relative to Jekyll’s assets dir
    return File.join("albums", album_name)
end

def get_album_artwork_dest_path()
    # Relative to album dest path
    return "artwork"
end

module Jekyll

    class AlbumSymbol < StaticFile
        def initialize(site, album)
            @album = album
            fn = get_album_symbol_filename()
            album_name = album["about"]["name"]

            super(
                site,
                site.source,
                File.join("_data", get_album_source_path(album_name)),
                fn)

            @relative_path = File.join(
                "assets",
                get_album_static_dest_path(album_name),
                fn)
        end

        def destination_rel_dir
            File.dirname(@relative_path) 
        end
    end

    class ArtworkItem < StaticFile
        def initialize(site, album, artwork_name, item_filename)
            @album = album
            @artwork_name = artwork_name
            album_name = album["about"]["name"]

            super(
                site,
                site.source,
                File.join(
                    "_data",
                    get_album_source_path(album_name),
                    "artwork",
                    artwork_name),
                item_filename)

            @relative_path = File.join(
                "assets",
                get_album_static_dest_path(album_name),
                "artwork",
                @artwork_name,
                item_filename)
        end

        def destination_rel_dir
            File.dirname(@relative_path) 
        end
    end

    class AlbumPage < Page
        def initialize(site, base, dir, album_data)
            @site = site
            @base = base
            @dir = dir
            @name = "index.html"

            self.process(@name)

            yaml_path = File.join(base, "_data", "albums", album_data["about"]["name"])
            self.read_yaml(yaml_path, "about.yaml")

            self.data["layout"] = "album"

            album_data.each do |key, value|
                self.data[key] = value
            end
        end
    end

    class AlbumGenerator < Generator
        safe true

        def generate(site)
            # If all albums should be served from under common path…
            base_path = site.config["albums_base_path"] || ""

            site.data["albums"].each do |album_data|
                album = album_data[1]
                album_name = album["about"]["name"]

                path = File.join(base_path, album_name)
                album["url"] = path

                symbol_static_file = AlbumSymbol.new(site, album)
                album["symbol_path"] = symbol_static_file.url
                site.static_files << symbol_static_file

                artwork_root = File.join(
                    site.source,
                    "_data",
                    get_album_source_path(album_name),
                    "artwork")

                album["artwork"].each do |artwork_name, artwork_data|
                    artwork_item_root = File.join(artwork_root, artwork_name)
                    next unless File.directory?(artwork_item_root)
                    artwork_items = []

                    Dir["#{artwork_item_root}/*"].each do |artwork_item|
                        next if (File.directory?(artwork_item) or !IMAGE_EXTS.include?(File.extname(artwork_item)))
                        item_filename = File.basename(artwork_item)

                        artwork_item_static_file = ArtworkItem.new(
                            site,
                            album,
                            artwork_name,
                            item_filename)
                        artwork_items.push({
                            "name" => File.basename(item_filename, ".*"),
                            "path" => artwork_item_static_file.url,
                            "source_path" => artwork_item_static_file.path,
                        })
                        site.static_files << artwork_item_static_file
                    end

                    album["artwork"][artwork_name]["items"] = artwork_items
                end

                site.pages << AlbumPage.new(site, site.source, path, album)
            end
        end
    end

end
