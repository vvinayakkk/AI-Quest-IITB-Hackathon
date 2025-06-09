import os
import shutil
import logging
from pathlib import Path
from typing import List, Set

logger = logging.getLogger(__name__)

class CleanupManager:
    """Manager for cleaning up unused folders and files"""
    
    def __init__(self, root_dir: str):
        """Initialize cleanup manager"""
        self.root_dir = Path(root_dir)
        self.required_dirs = {
            'config',      # Configuration files
            'graph',       # Graph RAG implementations
            'vision',      # Vision model implementations
            'agents',      # AI agents
            'utils',       # Utility functions
            'tests',       # Test files
            'data',        # Data storage
            'models',      # Model checkpoints
            'logs'         # Log files
        }
        self.required_files = {
            '__init__.py',
            'requirements.txt',
            'setup.py',
            'README.md',
            '.gitignore',
            'dev.py',
            'prod.py',
            'test.py',
            'cleanup.py',
            '.env.example',
            '.coveragerc'
        }
        self.files_to_remove = {
            'clean.py',
            'init.py',
            'run.py',
            'run_tests.py',
            'check.py',
            'update.py',
            'scrape.py',
            'db.sqlite3',
            'poetry.lock',
            'pyproject.toml',
            'manage.py',
            'utils.py',
            'config.py',
            'logging_config.py'
        }
        self.dirs_to_remove = {
            'ML',
            'wikipedia_scrape',
            'github_integration',
            'spam',
            'smartbot',
            'document_chat',
            'api'
        }
    
    def get_all_dirs(self) -> Set[Path]:
        """Get all directories in the project"""
        return {
            path for path in self.root_dir.rglob('*')
            if path.is_dir() and not any(part.startswith('.') for part in path.parts)
        }
    
    def get_all_files(self) -> Set[Path]:
        """Get all files in the project"""
        return {
            path for path in self.root_dir.rglob('*')
            if path.is_file() and not any(part.startswith('.') for part in path.parts)
        }
    
    def get_unused_dirs(self) -> Set[Path]:
        """Get unused directories"""
        all_dirs = self.get_all_dirs()
        required_dirs = {
            self.root_dir / dir_name
            for dir_name in self.required_dirs
        }
        return all_dirs - required_dirs
    
    def get_unused_files(self) -> Set[Path]:
        """Get unused files"""
        all_files = self.get_all_files()
        required_files = {
            self.root_dir / file_name
            for file_name in self.required_files
        }
        return all_files - required_files
    
    def create_required_dirs(self):
        """Create required directories if they don't exist"""
        for dir_name in self.required_dirs:
            dir_path = self.root_dir / dir_name
            if not dir_path.exists():
                dir_path.mkdir(parents=True)
                logger.info(f"Created directory: {dir_path}")
    
    def move_files_to_new_structure(self):
        """Move files to new directory structure"""
        # Move configuration files
        if (self.root_dir / 'config.py').exists():
            shutil.move(
                self.root_dir / 'config.py',
                self.root_dir / 'config' / 'config.py'
            )
        if (self.root_dir / 'logging_config.py').exists():
            shutil.move(
                self.root_dir / 'logging_config.py',
                self.root_dir / 'config' / 'logging_config.py'
            )
        
        # Move utility files
        if (self.root_dir / 'utils.py').exists():
            shutil.move(
                self.root_dir / 'utils.py',
                self.root_dir / 'utils' / 'utils.py'
            )
        
        # Move database file
        if (self.root_dir / 'db.sqlite3').exists():
            shutil.move(
                self.root_dir / 'db.sqlite3',
                self.root_dir / 'data' / 'db.sqlite3'
            )
    
    def cleanup_dirs(self, dry_run: bool = True) -> List[Path]:
        """Clean up unused directories"""
        # First remove explicitly marked directories
        for dir_name in self.dirs_to_remove:
            dir_path = self.root_dir / dir_name
            if dir_path.exists():
                try:
                    if dry_run:
                        logger.info(f"Would remove directory: {dir_path}")
                    else:
                        shutil.rmtree(dir_path)
                        logger.info(f"Removed directory: {dir_path}")
                except Exception as e:
                    logger.error(f"Error removing directory {dir_path}: {str(e)}")
        
        # Then remove other unused directories
        unused_dirs = self.get_unused_dirs()
        cleaned_dirs = []
        
        for dir_path in unused_dirs:
            try:
                if dry_run:
                    logger.info(f"Would remove directory: {dir_path}")
                else:
                    shutil.rmtree(dir_path)
                    logger.info(f"Removed directory: {dir_path}")
                cleaned_dirs.append(dir_path)
            except Exception as e:
                logger.error(f"Error removing directory {dir_path}: {str(e)}")
        
        return cleaned_dirs
    
    def cleanup_files(self, dry_run: bool = True) -> List[Path]:
        """Clean up unused files"""
        # First remove explicitly marked files
        for file_name in self.files_to_remove:
            file_path = self.root_dir / file_name
            if file_path.exists():
                try:
                    if dry_run:
                        logger.info(f"Would remove file: {file_path}")
                    else:
                        os.remove(file_path)
                        logger.info(f"Removed file: {file_path}")
                except Exception as e:
                    logger.error(f"Error removing file {file_path}: {str(e)}")
        
        # Then remove other unused files
        unused_files = self.get_unused_files()
        cleaned_files = []
        
        for file_path in unused_files:
            try:
                if dry_run:
                    logger.info(f"Would remove file: {file_path}")
                else:
                    os.remove(file_path)
                    logger.info(f"Removed file: {file_path}")
                cleaned_files.append(file_path)
            except Exception as e:
                logger.error(f"Error removing file {file_path}: {str(e)}")
        
        return cleaned_files
    
    def sync_with_server(self, server_dir: str, dry_run: bool = True):
        """Sync project with server directory"""
        server_path = Path(server_dir)
        
        try:
            # Create server directory if it doesn't exist
            if not server_path.exists():
                if dry_run:
                    logger.info(f"Would create server directory: {server_path}")
                else:
                    server_path.mkdir(parents=True)
                    logger.info(f"Created server directory: {server_path}")
            
            # Copy project files to server
            for file_path in self.get_all_files():
                rel_path = file_path.relative_to(self.root_dir)
                server_file = server_path / rel_path
                
                # Create parent directories if needed
                if not server_file.parent.exists():
                    if dry_run:
                        logger.info(f"Would create directory: {server_file.parent}")
                    else:
                        server_file.parent.mkdir(parents=True)
                        logger.info(f"Created directory: {server_file.parent}")
                
                # Copy file
                if dry_run:
                    logger.info(f"Would copy file: {file_path} -> {server_file}")
                else:
                    shutil.copy2(file_path, server_file)
                    logger.info(f"Copied file: {file_path} -> {server_file}")
            
            logger.info("Sync completed successfully")
            
        except Exception as e:
            logger.error(f"Error syncing with server: {str(e)}")
            raise

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Clean up unused folders and files')
    parser.add_argument('--root-dir', default='.', help='Root directory to clean up')
    parser.add_argument('--server-dir', help='Server directory to sync with')
    parser.add_argument('--dry-run', action='store_true', help='Perform a dry run')
    args = parser.parse_args()
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Initialize cleanup manager
    manager = CleanupManager(args.root_dir)
    
    # Create required directories
    manager.create_required_dirs()
    
    # Move files to new structure
    manager.move_files_to_new_structure()
    
    # Clean up directories
    cleaned_dirs = manager.cleanup_dirs(dry_run=args.dry_run)
    logger.info(f"Cleaned up {len(cleaned_dirs)} directories")
    
    # Clean up files
    cleaned_files = manager.cleanup_files(dry_run=args.dry_run)
    logger.info(f"Cleaned up {len(cleaned_files)} files")
    
    # Sync with server if specified
    if args.server_dir:
        manager.sync_with_server(args.server_dir, dry_run=args.dry_run)

if __name__ == '__main__':
    main() 