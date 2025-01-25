require 'fileutils'

def print_directory_structure(path, indent = "")
  entries = Dir.entries(path).reject { |e| e == '.' || e == '..' }

  entries.each do |entry|
    full_path = File.join(path, entry)
    puts "#{indent}├── #{entry}"
    if File.directory?(full_path)
      print_directory_structure(full_path, indent + "│   ")
    end
  end
end

if ARGV.length < 1
  puts "Usage: ruby directory_structure.rb <directory_path>"
  exit
end

directory_path = ARGV[0]

if Dir.exist?(directory_path)
  puts directory_path
  print_directory_structure(directory_path)
else
  puts "The specified directory does not exist."
end
