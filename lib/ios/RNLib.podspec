
Pod::Spec.new do |s|
  s.name         = "RNLib"
  s.version      = "1.0.0"
  s.summary      = "RNLib"
  s.description  = <<-DESC
                  RNLib
                   DESC
  s.homepage     = ""
  s.license      = "MIT"
  # s.license      = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author             = { "author" => "author@domain.cn" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/author/RNLib.git", :tag => "master" }
  s.source_files  = "RNLib/**/*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  #s.dependency "others"

end

  